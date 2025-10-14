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

export async function parseCSV(content: string, filename: string): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const transactions: ParsedTransaction[] = [];
          
          for (const row of results.data as any[]) {
            const dateField = row.Date || row.date || row.DATA || row.data;
            const nameField = row.Description || row.description || row.Name || row.name || row.DESCRICAO || row.descricao;
            const valueField = row.Amount || row.amount || row.Value || row.value || row.VALOR || row.valor;

            if (dateField && valueField) {
              let date: Date;
              
              if (dateField.includes("/")) {
                const parts = dateField.split("/");
                if (parts[0].length === 4) {
                  date = new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
                } else {
                  date = new Date(parts[2], parseInt(parts[0]) - 1, parts[1]);
                }
              } else if (dateField.includes("-")) {
                date = new Date(dateField);
              } else {
                date = new Date(dateField.substring(0, 4), parseInt(dateField.substring(4, 6)) - 1, parseInt(dateField.substring(6, 8)));
              }

              const value = typeof valueField === "string"
                ? parseFloat(valueField.replace(/[,$]/g, ""))
                : parseFloat(valueField);

              // Extract payment method and client name from description
              // Format: "Zelle from John Smith" -> paymentMethod="Zelle", name="John Smith"
              let paymentMethod: string | undefined;
              let clientName = nameField || "Transaction";
              let depositor: string | undefined;
              
              if (nameField && nameField.toLowerCase().includes("zelle")) {
                paymentMethod = "Zelle";
                
                // Extract client name from text after "from"
                const fromMatch = nameField.match(/from\s+(.+)/i);
                if (fromMatch) {
                  clientName = fromMatch[1].trim(); // This is the client name
                  depositor = clientName; // Store same value in depositor for matching
                }
              }

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

export async function parseFile(file: UploadedFile): Promise<ParsedTransaction[]> {
  const content = file.buffer.toString("utf-8");
  const filename = file.originalname;
  
  if (filename.toLowerCase().endsWith(".ofx")) {
    return parseOFX(content, filename);
  } else if (filename.toLowerCase().endsWith(".csv")) {
    return parseCSV(content, filename);
  } else {
    throw new Error("Unsupported file format");
  }
}
