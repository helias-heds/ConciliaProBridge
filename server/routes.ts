import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { parseFile } from "./parsers";
import { insertTransactionSchema, insertGoogleSheetsConnectionSchema } from "@shared/schema";
import { z } from "zod";
import { importFromGoogleSheets } from "./googleSheets";
import { reconcileTransactions } from "./reconciliation";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transactions/:id/match", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      if (!transaction.matchedTransactionId) {
        return res.status(404).json({ error: "No matched transaction found" });
      }

      const matchedTransaction = await storage.getTransaction(transaction.matchedTransactionId);
      if (!matchedTransaction) {
        return res.status(404).json({ error: "Matched transaction not found" });
      }

      res.json({
        original: transaction,
        matched: matchedTransaction
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      // Transform date string to Date object if needed
      const body = {
        ...req.body,
        date: typeof req.body.date === 'string' || typeof req.body.date === 'number' 
          ? new Date(req.body.date) 
          : req.body.date
      };
      const data = insertTransactionSchema.parse(body);
      const transaction = await storage.createTransaction(data);
      res.status(201).json(transaction);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      // Transform date string to Date object if needed
      const body = {
        ...req.body,
        ...(req.body.date && {
          date: typeof req.body.date === 'string' || typeof req.body.date === 'number' 
            ? new Date(req.body.date) 
            : req.body.date
        })
      };
      const updates = insertTransactionSchema.partial().parse(body);
      const transaction = await storage.updateTransaction(req.params.id, updates);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTransaction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/transactions/manual-reconcile", async (req, res) => {
    try {
      const { transactionId, matchId } = req.body;
      
      if (!transactionId || !matchId) {
        return res.status(400).json({ error: "Both transactionId and matchId are required" });
      }

      if (transactionId === matchId) {
        return res.status(400).json({ error: "Cannot reconcile a transaction with itself" });
      }

      const transaction1 = await storage.getTransaction(transactionId);
      const transaction2 = await storage.getTransaction(matchId);

      if (!transaction1 || !transaction2) {
        return res.status(404).json({ error: "One or both transactions not found" });
      }

      if (transaction1.status === "reconciled" || transaction2.status === "reconciled") {
        return res.status(400).json({ error: "One or both transactions are already reconciled" });
      }

      // Validate that transactions have complementary statuses (one pending-ledger, one pending-statement)
      const hasOppositeStatus = 
        (transaction1.status === "pending-ledger" && transaction2.status === "pending-statement") ||
        (transaction1.status === "pending-statement" && transaction2.status === "pending-ledger");

      if (!hasOppositeStatus) {
        return res.status(400).json({ 
          error: "Transactions must have complementary statuses (one pending-ledger and one pending-statement)" 
        });
      }

      // Update both transactions to reconciled status with manual flag
      await storage.updateTransaction(transactionId, {
        status: "reconciled",
        matchedTransactionId: matchId,
        confidence: 100, // Manual reconciliation has 100% confidence
      });

      await storage.updateTransaction(matchId, {
        status: "reconciled",
        matchedTransactionId: transactionId,
        confidence: 100,
      });

      res.json({ 
        message: "Transactions reconciled manually",
        transaction1: await storage.getTransaction(transactionId),
        transaction2: await storage.getTransaction(matchId),
      });
    } catch (error: any) {
      console.error("Manual reconciliation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/upload", upload.array("files", 10), async (req, res) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      console.log('\n📤 REQUEST BODY:', req.body);
      const uploadType = req.body.type || 'stripe'; // 'stripe' or 'bank'  
      console.log(`📤 UPLOAD TYPE: ${uploadType.toUpperCase()}`);

      const files = req.files as Express.Multer.File[];
      const allTransactions: any[] = [];
      const existingTransactions = await storage.getTransactions();
      let duplicateCount = 0;

      for (const file of files) {
        console.log(`\n📁 Processing file: ${file.originalname}`);
        console.log(`📊 File size: ${file.size} bytes (${(file.size / 1024).toFixed(2)} KB)`);
        const content = file.buffer.toString('utf-8');
        const lineCount = content.split(/\r?\n/).length;
        console.log(`📝 Total lines in raw file: ${lineCount}`);
        
        const parsedTransactions = await parseFile(file, uploadType);
        console.log(`✅ Parsed ${parsedTransactions.length} transactions from ${file.originalname}`);
        
        for (const parsed of parsedTransactions) {
          // Prefix source with upload type for reliable reconciliation matching
          const sourcePrefix = uploadType === 'stripe' ? 'Stripe' : 'Wells Fargo';
          const enhancedSource = `${sourcePrefix} - ${parsed.source}`;
          
          // For Bank CSV: only compare against same source (Wells Fargo vs Wells Fargo)
          // For Stripe: only compare against same source (Stripe vs Stripe)
          // Never compare CSV against Google Sheets ledger
          const relevantExisting = existingTransactions.filter(tx => 
            tx.source?.startsWith(sourcePrefix)
          );
          
          // Check for duplicates ONLY within same source
          const isDuplicate = relevantExisting.some(existing => {
            const sameDate = new Date(existing.date).toDateString() === parsed.date.toDateString();
            const sameValue = parseFloat(existing.value) === parsed.value;
            
            // For Credit Card: match by date + value only
            if (parsed.paymentMethod === "Credit Card") {
              return sameDate && sameValue;
            }
            
            // For Zelle/Deposit: match by date + value + depositor (if available)
            if (parsed.depositor && existing.depositor) {
              const sameDepositor = parsed.depositor.toLowerCase() === existing.depositor.toLowerCase();
              return sameDate && sameValue && sameDepositor;
            }
            
            // Fallback: match by date + value + name
            const sameName = parsed.name.toLowerCase() === existing.name.toLowerCase();
            return sameDate && sameValue && sameName;
          });

          if (isDuplicate) {
            duplicateCount++;
            console.log(`⏭️  Skipping duplicate #${duplicateCount}: ${parsed.date.toISOString().split('T')[0]}, $${parsed.value}, depositor="${parsed.depositor || parsed.name}"`);
            continue;
          }

          const transaction = await storage.createTransaction({
            date: parsed.date,
            name: parsed.name,
            value: parsed.value.toString(),
            status: "pending-statement",
            source: enhancedSource,
            car: null,
            confidence: null,
            paymentMethod: parsed.paymentMethod || null,
            depositor: parsed.depositor || null,
            matchedTransactionId: null,
          });
          allTransactions.push(transaction);
        }
      }

      console.log(`\n📊 IMPORT SUMMARY:`);
      console.log(`   ✅ New transactions: ${allTransactions.length}`);
      console.log(`   ⏭️  Duplicates skipped: ${duplicateCount}`);
      console.log(`   📁 Total processed: ${allTransactions.length + duplicateCount}`);

      res.status(201).json({
        message: `Successfully imported ${allTransactions.length} new transactions (${duplicateCount} duplicates skipped)`,
        count: allTransactions.length,
        duplicates: duplicateCount,
        transactions: allTransactions,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message || "Failed to process files" });
    }
  });

  app.get("/api/google-sheets/connection", async (req, res) => {
    try {
      const connection = await storage.getGoogleSheetsConnection();
      if (!connection) {
        return res.json(null);
      }
      
      const safeConnection = {
        ...connection,
        apiKey: connection.apiKey ? "***" + connection.apiKey.slice(-4) : "",
      };
      
      res.json(safeConnection);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/google-sheets/connect", async (req, res) => {
    try {
      const schema = z.object({
        sheetUrl: z.string().url("Valid URL is required"),
      });
      
      const data = schema.parse(req.body);

      const sheetIdMatch = data.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const sheetId = sheetIdMatch ? sheetIdMatch[1] : null;

      if (!sheetId) {
        return res.status(400).json({ error: "Could not extract sheet ID from URL. Please provide a valid Google Sheets URL." });
      }

      const connection = await storage.saveGoogleSheetsConnection({
        apiKey: "managed-by-replit-integration",
        sheetUrl: data.sheetUrl,
        sheetId,
        status: "connected",
      });

      res.json({
        message: "Google Sheets connection saved successfully",
        connection: {
          ...connection,
          apiKey: "***",
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reconcile", async (req, res) => {
    try {
      const allTransactions = await storage.getTransactions();
      
      // Get pending CSV transactions (from bank/card statements)
      const csvTransactions = allTransactions.filter(
        (tx) => tx.status === "pending-statement"
      );
      
      // Get pending Google Sheets transactions (from ledger)
      const sheetTransactions = allTransactions.filter(
        (tx) => tx.status === "pending-ledger"
      );

      if (csvTransactions.length === 0) {
        return res.json({
          message: "No CSV transactions to reconcile",
          matches: 0,
          unmatchedCsv: 0,
          unmatchedSheets: sheetTransactions.length,
        });
      }

      if (sheetTransactions.length === 0) {
        return res.json({
          message: "No Google Sheets transactions to reconcile against",
          matches: 0,
          unmatchedCsv: csvTransactions.length,
          unmatchedSheets: 0,
        });
      }

      // Perform reconciliation
      const result = reconcileTransactions(csvTransactions, sheetTransactions);

      // Update matched transactions
      for (const match of result.matches) {
        // Update CSV transaction
        await storage.updateTransaction(match.csvTransaction.id, {
          status: "reconciled",
          matchedTransactionId: match.sheetTransaction.id,
          confidence: match.confidence,
        });

        // Update Sheet transaction
        await storage.updateTransaction(match.sheetTransaction.id, {
          status: "reconciled",
          matchedTransactionId: match.csvTransaction.id,
          confidence: match.confidence,
        });
      }

      res.json({
        message: `Reconciliation complete: ${result.matches.length} matches found`,
        matches: result.matches.length,
        unmatchedCsv: result.unmatchedCsv.length,
        unmatchedSheets: result.unmatchedSheets.length,
        details: result.matches.map((m) => ({
          csvTransactionId: m.csvTransaction.id,
          sheetTransactionId: m.sheetTransaction.id,
          confidence: m.confidence,
          reasons: m.reasons,
        })),
      });
    } catch (error: any) {
      console.error("Reconciliation error:", error);
      res.status(500).json({ error: error.message || "Failed to reconcile transactions" });
    }
  });

  app.post("/api/google-sheets/import", async (req, res) => {
    try {
      const connection = await storage.getGoogleSheetsConnection();
      
      if (!connection) {
        return res.status(404).json({ error: "No Google Sheets connection found. Please connect first." });
      }

      if (!connection.sheetId) {
        return res.status(400).json({ error: "Invalid sheet URL. Could not extract sheet ID." });
      }

      const sheetTransactions = await importFromGoogleSheets(connection.sheetId);
      
      // Get existing Google Sheets transactions to check for duplicates
      const allTransactions = await storage.getTransactions();
      const existingSheetTxs = allTransactions.filter(tx => tx.source === "Google Sheets");
      
      console.log(`📊 Found ${sheetTransactions.length} transactions in Google Sheets`);
      console.log(`📦 Found ${existingSheetTxs.length} existing Google Sheets transactions in database`);
      
      // Create a Set of unique keys for fast duplicate detection
      const existingKeys = new Set(
        existingSheetTxs.map(tx => {
          const dateKey = tx.date.toISOString().split('T')[0];
          const valueKey = parseFloat(tx.value);
          return `${dateKey}|${valueKey}|${tx.name}|${tx.depositor || ''}`;
        })
      );
      
      const newTransactions = [];
      let skippedCount = 0;
      
      for (const sheetTx of sheetTransactions) {
        // Create unique key for this transaction
        const dateKey = sheetTx.date.toISOString().split('T')[0];
        const transactionKey = `${dateKey}|${sheetTx.value}|${sheetTx.name}|${sheetTx.depositor || ''}`;
        
        if (existingKeys.has(transactionKey)) {
          skippedCount++;
          continue;
        }

        newTransactions.push({
          date: sheetTx.date,
          name: sheetTx.name,
          value: sheetTx.value.toString(),
          status: "pending-ledger",
          source: "Google Sheets",
          car: sheetTx.car || null,
          depositor: sheetTx.depositor || null,
          confidence: null,
          paymentMethod: sheetTx.paymentMethod || null,
          matchedTransactionId: null,
          sheetOrder: sheetTx.sheetOrder || null,
        });
        
        // Add to existing keys to prevent duplicates within this import
        existingKeys.add(transactionKey);
      }

      // Batch insert all new transactions at once
      const createdTransactions = await storage.createTransactions(newTransactions);

      console.log(`✅ Imported ${createdTransactions.length} new transactions`);
      console.log(`⏭️  Skipped ${skippedCount} duplicate transactions`);

      await storage.updateGoogleSheetsConnection(connection.id, {
        lastImportDate: new Date(),
        lastImportCount: createdTransactions.length,
      });

      res.json({
        message: `Successfully imported ${createdTransactions.length} new transactions from Google Sheets (${skippedCount} duplicates skipped)`,
        count: createdTransactions.length,
        skipped: skippedCount,
        total: sheetTransactions.length,
        connection: {
          sheetUrl: connection.sheetUrl,
          lastImportDate: new Date(),
        },
      });
    } catch (error: any) {
      console.error("Google Sheets import error:", error);
      res.status(500).json({ error: error.message || "Failed to import from Google Sheets" });
    }
  });

  app.post("/api/database/clear", async (req, res) => {
    try {
      const { keepGoogleSheetsConnection } = req.body;
      
      // Delete all transactions
      const deletedCount = await storage.clearTransactions();
      
      let connectionDeleted = false;
      if (!keepGoogleSheetsConnection) {
        const connection = await storage.getGoogleSheetsConnection();
        if (connection) {
          await storage.deleteGoogleSheetsConnection(connection.id);
          connectionDeleted = true;
        }
      }
      
      console.log(`🗑️  Database cleared: ${deletedCount} transactions deleted`);
      if (connectionDeleted) {
        console.log(`🗑️  Google Sheets connection removed`);
      }

      res.json({
        message: `Database cleared successfully. ${deletedCount} transactions deleted${connectionDeleted ? ', Google Sheets connection removed' : ''}`,
        transactionsDeleted: deletedCount,
        connectionDeleted,
      });
    } catch (error: any) {
      console.error("Database clear error:", error);
      res.status(500).json({ error: error.message || "Failed to clear database" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
