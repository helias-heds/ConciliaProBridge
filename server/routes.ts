import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { parseFile } from "./parsers";
import { insertTransactionSchema, insertGoogleSheetsConnectionSchema } from "@shared/schema";
import { z } from "zod";

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

  app.post("/api/transactions", async (req, res) => {
    try {
      const data = insertTransactionSchema.parse(req.body);
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
      const updates = insertTransactionSchema.partial().parse(req.body);
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

  app.post("/api/upload", upload.array("files", 10), async (req, res) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const files = req.files as Express.Multer.File[];
      const allTransactions: any[] = [];

      for (const file of files) {
        const parsedTransactions = await parseFile(file);
        
        for (const parsed of parsedTransactions) {
          const transaction = await storage.createTransaction({
            date: parsed.date,
            name: parsed.name,
            value: parsed.value.toString(),
            status: "pending-statement",
            source: parsed.source,
            car: null,
            confidence: null,
          });
          allTransactions.push(transaction);
        }
      }

      res.status(201).json({
        message: `Successfully imported ${allTransactions.length} transactions from ${files.length} file(s)`,
        count: allTransactions.length,
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
      const data = insertGoogleSheetsConnectionSchema.extend({
        apiKey: z.string().min(1, "API key is required"),
        sheetUrl: z.string().url("Valid URL is required"),
      }).parse(req.body);

      const sheetIdMatch = data.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const sheetId = sheetIdMatch ? sheetIdMatch[1] : null;

      const connection = await storage.saveGoogleSheetsConnection({
        ...data,
        sheetId,
        status: "connected",
      });

      res.json({
        message: "Google Sheets connection saved successfully",
        connection: {
          ...connection,
          apiKey: "***" + data.apiKey.slice(-4),
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/google-sheets/import", async (req, res) => {
    try {
      const connection = await storage.getGoogleSheetsConnection();
      
      if (!connection) {
        return res.status(404).json({ error: "No Google Sheets connection found. Please connect first." });
      }

      await storage.updateGoogleSheetsConnection(connection.id, {
        lastImportDate: new Date(),
        lastImportCount: 0,
      });

      res.json({
        message: "Import placeholder - Full Google Sheets API integration requires additional libraries",
        note: "You can manually upload CSV exports from your Google Sheet in the meantime. To implement full Google Sheets API, install googleapis package and use Sheets API v4.",
        connection: {
          sheetUrl: connection.sheetUrl,
          lastImportDate: new Date(),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
