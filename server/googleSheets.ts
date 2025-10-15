import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings?.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

export async function getUncachableGoogleSheetClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

export interface SheetTransaction {
  date: Date;
  name: string;
  car?: string;
  depositor?: string;
  value: number;
}

export async function importFromGoogleSheets(sheetId: string): Promise<SheetTransaction[]> {
  const sheets = await getUncachableGoogleSheetClient();
  
  // Get all rows using batchGet to avoid API response limits
  // Split into chunks: 0-5000, 5000-10000, 10000-15000 (max 15k to be safe)
  const batchResponse = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: sheetId,
    ranges: [
      'A1:F5000',
      'A5001:F10000',
      'A10001:F15000'
    ],
  });

  // Combine all rows from all ranges
  let allRows: any[][] = [];
  if (batchResponse.data.valueRanges) {
    for (const range of batchResponse.data.valueRanges) {
      if (range.values && range.values.length > 0) {
        allRows = allRows.concat(range.values);
      }
    }
  }

  if (allRows.length === 0) {
    return [];
  }

  console.log(`📊 Google Sheets: Found ${allRows.length} total rows (including header from first batch)`);

  const transactions: SheetTransaction[] = [];
  let skippedEmpty = 0;
  let skippedInvalidValue = 0;
  
  // First row of first batch is the header, skip it
  const rows = allRows.slice(1);
  
  console.log(`📋 Processing ${rows.length} data rows (header already removed)`);
  
  // Process all data rows (header already removed)
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because: +1 for 1-based index, +1 for header
    
    // Column A (date) and B (value) are required
    if (!row[0] || !row[1]) {
      skippedEmpty++;
      console.log(`⏭️  Row ${rowNum}: Skipped (empty date or value) - Date: "${row[0]}", Value: "${row[1]}"`);
      continue;
    }

    // Column A: Date - Parse as UTC to avoid timezone issues
    const dateStr = row[0];
    let date: Date;
    
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      let year: number, month: number, day: number;
      
      if (parts[0].length === 4) {
        // Format: YYYY/MM/DD
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
        day = parseInt(parts[2]);
      } else {
        // Format: MM/DD/YYYY
        year = parseInt(parts[2]);
        month = parseInt(parts[0]) - 1; // JavaScript months are 0-indexed
        day = parseInt(parts[1]);
      }
      
      // Create date at noon UTC to avoid timezone shift issues
      date = new Date(Date.UTC(year, month, day, 12, 0, 0));
    } else {
      date = new Date(dateStr);
    }

    // Column B: Value (Valor)
    const valueStr = typeof row[1] === 'string' ? row[1].replace(/[,$]/g, '') : row[1];
    const value = parseFloat(valueStr);
    
    // Column D: Car (Carro) - index 3
    const car = row[3] ? row[3].trim() : undefined;
    
    // Column E: Client Name (Nome do cliente) - index 4
    const name = row[4] ? row[4].trim() : 'Unknown';
    
    // Column F: Depositor Name (Nome do Depositor) - index 5
    const depositor = row[5] ? row[5].trim() : undefined;

    if (isNaN(value)) {
      skippedInvalidValue++;
      console.log(`⏭️  Row ${rowNum}: Skipped (invalid value) - Value: "${row[1]}" → parsed as NaN`);
      continue;
    }

    transactions.push({
      date,
      name,
      car,
      depositor,
      value: Math.abs(value),
    });
  }

  console.log(`✅ Google Sheets: Successfully parsed ${transactions.length} transactions (installments)`);
  if (skippedEmpty > 0) {
    console.log(`⚠️  Skipped ${skippedEmpty} rows with empty date/value`);
  }
  if (skippedInvalidValue > 0) {
    console.log(`⚠️  Skipped ${skippedInvalidValue} rows with invalid values`);
  }
  
  return transactions;
}
