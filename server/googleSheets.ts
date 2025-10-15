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
  
  // First row of first batch is the header, skip it
  const rows = allRows.slice(1);
  
  console.log(`📋 Processing ${rows.length} data rows (header already removed)`);
  
  // Process all data rows (header already removed)
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // Column A (date) and B (value) are required
    if (!row[0] || !row[1]) {
      continue; // Skip empty rows silently
    }

    // Column A: Date
    const dateStr = row[0];
    let date: Date;
    
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts[0].length === 4) {
        // Format: YYYY/MM/DD
        date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        // Format: MM/DD/YYYY
        date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
      }
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
      continue; // Skip rows with invalid values silently
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
  return transactions;
}
