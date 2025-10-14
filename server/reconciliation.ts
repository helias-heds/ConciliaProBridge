import type { Transaction } from "@shared/schema";

interface ReconciliationMatch {
  csvTransaction: Transaction;
  sheetTransaction: Transaction;
  confidence: number;
  reasons: string[];
}

export interface ReconciliationResult {
  matches: ReconciliationMatch[];
  unmatchedCsv: Transaction[];
  unmatchedSheets: Transaction[];
}

/**
 * Check if two dates are within tolerance (default: ±2 days)
 */
function datesMatch(date1: Date, date2: Date, toleranceDays: number = 2): boolean {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  const daysDiff = diff / (1000 * 60 * 60 * 24);
  return daysDiff <= toleranceDays;
}

/**
 * Check if values match (allowing small floating point differences)
 */
function valuesMatch(value1: string | number, value2: string | number): boolean {
  const v1 = typeof value1 === "string" ? parseFloat(value1) : value1;
  const v2 = typeof value2 === "string" ? parseFloat(value2) : value2;
  return Math.abs(v1 - v2) < 0.01; // Allow 1 cent difference for floating point
}

/**
 * Check if names match (case insensitive, trimmed)
 */
function namesMatch(name1: string | null, name2: string | null): boolean {
  if (!name1 || !name2) return false;
  return name1.trim().toLowerCase() === name2.trim().toLowerCase();
}

/**
 * Find the best match for a CSV transaction from a list of sheet transactions
 */
function findBestMatch(
  csvTx: Transaction,
  sheetTransactions: Transaction[]
): ReconciliationMatch | null {
  let bestMatch: ReconciliationMatch | null = null;
  let highestConfidence = 0;

  for (const sheetTx of sheetTransactions) {
    const reasons: string[] = [];
    let confidence = 0;

    // REQUIRED: Check date match
    if (!datesMatch(new Date(csvTx.date), new Date(sheetTx.date))) {
      continue; // Skip if dates don't match
    }
    reasons.push("Date matches");
    confidence += 25;

    // REQUIRED: Check value match
    if (!valuesMatch(csvTx.value, sheetTx.value)) {
      continue; // Skip if values don't match
    }
    reasons.push("Value matches");
    confidence += 25;

    // REQUIRED: Check payment method is Zelle
    // Google Sheets doesn't import payment method, so we only validate CSV has Zelle
    if (csvTx.paymentMethod?.toLowerCase() !== "zelle") {
      continue; // Skip if not Zelle payment
    }
    reasons.push("Payment method: Zelle");
    confidence += 20;

    // REQUIRED: Check if CSV depositor matches sheet client name or depositor
    const csvDepositor = csvTx.depositor?.trim().toLowerCase();
    const sheetName = sheetTx.name?.trim().toLowerCase();
    const sheetDepositor = sheetTx.depositor?.trim().toLowerCase();

    let nameMatched = false;

    if (csvDepositor) {
      if (csvDepositor === sheetName) {
        reasons.push("Depositor matches client name");
        confidence += 30;
        nameMatched = true;
      } else if (csvDepositor === sheetDepositor) {
        reasons.push("Depositor matches depositor");
        confidence += 30;
        nameMatched = true;
      }
    }

    // Also check if CSV name matches sheet client name
    const csvName = csvTx.name?.trim().toLowerCase();
    if (!nameMatched && csvName && csvName === sheetName) {
      reasons.push("Name matches");
      confidence += 10;
      nameMatched = true;
    }

    // REQUIRED: Must have name match to proceed
    if (!nameMatched) {
      continue; // Skip if no name/depositor match
    }

    // Track best match (highest confidence)
    if (confidence > highestConfidence) {
      highestConfidence = confidence;
      bestMatch = {
        csvTransaction: csvTx,
        sheetTransaction: sheetTx,
        confidence,
        reasons,
      };
    }
  }

  return bestMatch;
}

/**
 * Reconcile CSV transactions with Google Sheets transactions
 */
export function reconcileTransactions(
  csvTransactions: Transaction[],
  sheetTransactions: Transaction[]
): ReconciliationResult {
  const matches: ReconciliationMatch[] = [];
  const unmatchedCsv: Transaction[] = [];
  const matchedSheetIds = new Set<string>();

  for (const csvTx of csvTransactions) {
    const availableSheetTxs = sheetTransactions.filter(
      (tx) => !matchedSheetIds.has(tx.id)
    );

    const match = findBestMatch(csvTx, availableSheetTxs);

    if (match) {
      matches.push(match);
      matchedSheetIds.add(match.sheetTransaction.id);
    } else {
      unmatchedCsv.push(csvTx);
    }
  }

  const unmatchedSheets = sheetTransactions.filter(
    (tx) => !matchedSheetIds.has(tx.id)
  );

  return {
    matches,
    unmatchedCsv,
    unmatchedSheets,
  };
}
