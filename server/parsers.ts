import { parseString } from "xml2js";
import Papa from "papaparse";
import type { InsertTransaction } from "@shared/schema";

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
}

export interface ParsedTransaction {
  date: Date;
  name: string;
  value: number;
  source: string;
  paymentMethod?: string;
  depositor?: string;
}

export async function parseOFX(content: string, filename: string): Promise<ParsedTransaction[]> {
  const transactions: ParsedTransaction[] = [];
  
  try {
    const ofxData = content.replace(/\n/g, "").replace(/<OFX>.*?<STMTTRN>/g, "<OFX><STMTTRN>");
    const stmtRegex = /<STMTTRN>(.*?)<\/STMTTRN>/g;
    let match;

    while ((match = stmtRegex.exec(ofxData)) !== null) {
      const trn = match[1];
      
      const dateMatch = /<DTPOSTED>(\d{8})/i.exec(trn);
      const amountMatch = /<TRNAMT>([-\d.]+)/i.exec(trn);
      const memoMatch = /<MEMO>(.*?)</i.exec(trn);
      const nameMatch = /<NAME>(.*?)</i.exec(trn);

      if (dateMatch && amountMatch) {
        const dateStr = dateMatch[1];
        const date = new Date(
          parseInt(dateStr.substring(0, 4)),
          parseInt(dateStr.substring(4, 6)) - 1,
          parseInt(dateStr.substring(6, 8))
        );
        
        const name = nameMatch ? nameMatch[1].trim() : (memoMatch ? memoMatch[1].trim() : "Transaction");
        const value = parseFloat(amountMatch[1]);

        transactions.push({
          date,
          name,
          value: Math.abs(value),
          source: filename,
        });
      }
    }
  } catch (error) {
    console.error("Error parsing OFX:", error);
    throw new Error("Failed to parse OFX file");
  }

  return transactions;
}

// Manual CSV parser that handles quoted fields correctly
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current);
  
  return result;
}

export async function parseCSV(content: string, filename: string, uploadType: string = 'stripe'): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    // First, try to detect if CSV has headers
    const lines = content.trim().split('\n');
    const firstLine = lines[0];
    
    // For Stripe (credit card): Check if first line looks like headers
    // For Bank (Wells Fargo): No headers, direct array parsing
    const hasHeaders = uploadType === 'stripe' 
      ? /date|amount|value|description|name|created|captured/i.test(firstLine)
      : false;
    
    console.log(`\n=== CSV PARSING START: ${filename} ===`);
    console.log(`Upload type: ${uploadType.toUpperCase()}`);
    console.log(`Detected headers: ${hasHeaders}`);
    
    // For Wells Fargo (no headers), use manual parser
    if (!hasHeaders && uploadType === 'bank') {
      console.log('🔧 Using manual CSV parser for Wells Fargo format');
      const transactions: ParsedTransaction[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;
        
        // Remove outer quotes first (the entire line is wrapped in quotes)
        while (line.startsWith('"') && line.endsWith('"') && line.length > 1) {
          line = line.slice(1, -1);
        }
        
        // Then fix any remaining double quotes
        line = line.replace(/""/g, '"');
        
        console.log(`Cleaned line ${i}: "${line}"`);
        
        const fields = parseCSVLine(line);
        console.log(`Row ${i} fields (${fields.length}): [${fields.map(f => `"${f}"`).join(', ')}]`);
        
        if (fields.length >= 4) {
          const dateField = fields[0];
          const valueField = fields[1];
          const description = fields[3];
          
          console.log(`  → Date: ${dateField}, Value: ${valueField}, Desc: ${description}`);
          
          if (dateField && valueField) {
            try {
              // Parse date (MM/DD/YY format)
              const parts = dateField.split("/");
              let year = parseInt(parts[2]);
              if (year < 100) year += 2000;
              const date = new Date(year, parseInt(parts[0]) - 1, parseInt(parts[1]));
              
              // Parse value (remove quotes if present)
              const value = Math.abs(parseFloat(valueField.replace(/"/g, '')));
              
              // Extract Zelle name from description
              let depositor = '';
              if (description && description.includes('ZELLE FROM')) {
                const match = description.match(/ZELLE FROM ([^O]+?)(?:\sON\s)/i);
                if (match) {
                  depositor = match[1].trim();
                }
              }
              
              if (!isNaN(value) && !isNaN(date.getTime())) {
                transactions.push({
                  date,
                  name: description || 'Bank Transaction',
                  value,
                  source: filename,
                  paymentMethod: description?.includes('ZELLE') ? 'Zelle' : undefined,
                  depositor: depositor || undefined
                });
                console.log(`  ✅ Added transaction: ${date.toISOString().split('T')[0]}, $${value}, ${depositor || 'no depositor'}`);
              }
            } catch (err) {
              console.log(`  ❌ Failed to parse row: ${err}`);
            }
          }
        }
      }
      
      console.log(`\nManual parser: ${transactions.length} transactions`);
      resolve(transactions);
      return;
    }
    
    // For other files, use PapaParse
    Papa.parse(content, {
      header: hasHeaders,
      skipEmptyLines: true,
      delimiter: ',',
      quoteChar: '"',
      escapeChar: '"',
      complete: (results) => {
        try {
          console.log(`Total rows in CSV: ${results.data.length}`);
          
          if (results.data.length > 0) {
            if (hasHeaders) {
              console.log('First row columns:', Object.keys(results.data[0] as any));
              console.log('First row sample:', results.data[0]);
            } else {
              console.log('First row (no headers):', results.data[0]);
            }
          }
          
          const transactions: ParsedTransaction[] = [];
          
          // Determine if this is a credit card or bank file based on uploadType
          const isCreditCardFile = uploadType === 'stripe';
          const isBankFile = uploadType === 'bank';
          
          if (isCreditCardFile) {
            console.log('⚠️ STRIPE CREDIT CARD FILE - Will import only date and value (no names)');
          } else if (isBankFile) {
            console.log('🏦 WELLS FARGO BANK FILE - Will extract Zelle names from descriptions');
          }
          
          for (const row of results.data as any[]) {
            let dateField, nameField, valueField;
            
            if (hasHeaders) {
              // CSV with headers - access by column name
              // For credit card files, skip if not captured (Captured = false)
              if (isCreditCardFile) {
                const capturedField = row.Captured || row.captured;
                if (capturedField && capturedField.toString().toLowerCase() === 'false') {
                  console.log(`⏭️  Skipping uncaptured credit card transaction (Captured=false)`);
                  continue;
                }
              }
              
              dateField = row.Date || row.date || row.DATA || row.data || row['Created date (UTC)'] || row['Created Date'] || row['Created date'];
              // For credit card files, ignore nameField completely
              nameField = isCreditCardFile ? undefined : (row.Description || row.description || row.Name || row.name || row.DESCRICAO || row.descricao);
              valueField = row.Amount || row.amount || row.Value || row.value || row.VALOR || row.valor;
            } else {
              // CSV without headers - access by array index
              // Format: date, value, empty, description
              // Example: 10/09/25,"-4363.67","","GUSTO NET..."
              dateField = row[0];
              valueField = row[1];
              nameField = row[3]; // Description is at index 3
            }

            console.log(`Row check: dateField="${dateField}", nameField="${nameField}", valueField="${valueField}", isCreditCard=${isCreditCardFile}`);

            if (dateField && valueField) {
              let date: Date;
              
              if (dateField.includes("/")) {
                const parts = dateField.split("/");
                if (parts[0].length === 4) {
                  // Format: YYYY/MM/DD
                  date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                } else {
                  // Format: MM/DD/YY or MM/DD/YYYY
                  let year = parseInt(parts[2]);
                  // If year is 2 digits (e.g., 25), assume 2000+
                  if (year < 100) {
                    year += 2000;
                  }
                  const month = parseInt(parts[0]) - 1;
                  const day = parseInt(parts[1]);
                  date = new Date(year, month, day);
                }
              } else if (dateField.includes("-")) {
                // Handle formats like "2025-10-15" or "2025-10-15 11:48:36"
                const parts = dateField.split(' ');
                const datePart = parts[0];
                const timePart = parts[1];
                const [year, month, day] = datePart.split('-').map(Number);
                
                if (isCreditCardFile) {
                  // CREDIT CARD: Convert UTC to Eastern Time (ET)
                  // ET is UTC-5 (EST) or UTC-4 (EDT), using UTC-5 for consistency
                  const utcDate = new Date(`${datePart}T${timePart || '00:00:00'}Z`);
                  
                  // Convert to ET by subtracting 5 hours (EST)
                  const etDate = new Date(utcDate.getTime() - (5 * 60 * 60 * 1000));
                  
                  // Extract the date in ET timezone (ignore the time, just get the date)
                  const etYear = etDate.getUTCFullYear();
                  const etMonth = etDate.getUTCMonth();
                  const etDay = etDate.getUTCDate();
                  
                  // Store as midnight UTC for the ET date
                  date = new Date(Date.UTC(etYear, etMonth, etDay, 0, 0, 0, 0));
                  
                  console.log(`📅 Credit card: UTC ${datePart} ${timePart || '00:00'} → ET date ${etYear}-${(etMonth+1).toString().padStart(2, '0')}-${etDay.toString().padStart(2, '0')} → Stored as ${date.toISOString()}`);
                } else {
                  // BANK CSV (Zelle): Use local date without UTC conversion
                  date = new Date(year, month - 1, day);
                  console.log(`📅 Bank CSV: Using date ${datePart} → ${date.toISOString()}`);
                }
              } else {
                date = new Date(dateField.substring(0, 4), parseInt(dateField.substring(4, 6)) - 1, parseInt(dateField.substring(6, 8)));
              }

              const value = typeof valueField === "string"
                ? parseFloat(valueField.replace(/[,$]/g, ""))
                : parseFloat(valueField);

              // Skip if value is 0 or NaN
              if (!value || value === 0) {
                continue;
              }

              // Extract payment method and client name from description
              let paymentMethod: string | undefined;
              let clientName: string;
              let depositor: string | undefined;
              
              if (nameField && nameField.toLowerCase().includes("zelle")) {
                // Zelle transaction: extract name from "Zelle from [Name]"
                paymentMethod = "Zelle";
                
                const fromMatch = nameField.match(/from\s+(.+)/i);
                if (fromMatch) {
                  let rawName = fromMatch[1].trim();
                  rawName = rawName.replace(/\s+on\s+.*/i, '');
                  rawName = rawName.replace(/[\d\-\(\)]+.*$/, '');
                  clientName = rawName.trim();
                  depositor = clientName;
                } else {
                  clientName = nameField;
                }
              } else if (nameField) {
                // Has description but not Zelle - generic transaction
                clientName = nameField;
              } else {
                // No description - unified payment (credit card)
                paymentMethod = "Credit Card";
                clientName = "Credit Card Payment";
              }

              console.log(`CSV parsed transaction: date=${date.toISOString()}, value=${value}, name="${clientName}", paymentMethod=${paymentMethod || 'none'}, depositor=${depositor || 'none'}`);

              transactions.push({
                date,
                name: clientName,
                value: Math.abs(value),
                source: filename,
                paymentMethod,
                depositor,
              });
            }
          }

          resolve(transactions);
        } catch (error) {
          reject(new Error("Failed to parse CSV file"));
        }
      },
      error: (error: any) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

export async function parseFile(file: UploadedFile, uploadType: string = 'stripe'): Promise<ParsedTransaction[]> {
  const content = file.buffer.toString("utf-8");
  const filename = file.originalname;
  
  if (filename.toLowerCase().endsWith(".ofx")) {
    return parseOFX(content, filename);
  } else if (filename.toLowerCase().endsWith(".csv")) {
    return parseCSV(content, filename, uploadType);
  } else {
    throw new Error("Unsupported file format");
  }
}
