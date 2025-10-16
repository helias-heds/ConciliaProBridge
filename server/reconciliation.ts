import type { Transaction } from "@shared/schema";
import { compareTwoStrings } from "string-similarity";

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
 * Calculate name similarity score (0-100%)
 * Returns 100 for exact match, 0-99 for partial similarity
 */
function getNameSimilarity(name1: string | null, name2: string | null): number {
  if (!name1 || !name2) return 0;
  
  const str1 = name1.trim().toLowerCase();
  const str2 = name2.trim().toLowerCase();
  
  // Exact match = 100%
  if (str1 === str2) return 100;
  
  // Use string-similarity library (returns 0-1, we convert to 0-100)
  const similarity = compareTwoStrings(str1, str2);
  return Math.round(similarity * 100);
}

/**
 * Check if payment method and source are compatible
 * Source is prefixed with upload type: "Stripe - filename" or "Wells Fargo - filename"
 */
function paymentMethodMatchesSource(sheetPaymentMethod: string | null, csvSource: string | null): boolean {
  if (!sheetPaymentMethod || !csvSource) {
    // If no payment method specified, allow matching (legacy behavior)
    return true;
  }

  const method = sheetPaymentMethod.toLowerCase().trim();
  const source = csvSource.toLowerCase();

  // Credit Card → must be from Stripe (check prefix)
  if (method.includes("credit") || method.includes("card")) {
    return source.startsWith("stripe");
  }

  // Zelle or Deposit → must be from Wells Fargo (check prefix)
  if (method.includes("zelle") || method.includes("deposit")) {
    return source.startsWith("wells fargo");
  }

  // Unknown payment method - allow matching
  return true;
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

    // REQUIRED: Check payment method compatibility with source
    if (!paymentMethodMatchesSource(sheetTx.paymentMethod, csvTx.source)) {
      console.log(`[RECONCILE] ❌ SKIPPED: Payment method "${sheetTx.paymentMethod}" incompatible with source "${csvTx.source}"`);
      continue; // Skip if payment method doesn't match source
    }

    // REQUIRED: Check date match (±2 days)
    if (!datesMatch(new Date(csvTx.date), new Date(sheetTx.date))) {
      continue; // Skip if dates don't match
    }
    reasons.push("Date matches (±2 days)");
    confidence += 30;

    // REQUIRED: Check value match (exact)
    if (!valuesMatch(csvTx.value, sheetTx.value)) {
      continue; // Skip if values don't match
    }
    reasons.push("Value matches exactly");
    confidence += 30;

    // Check if this is a unified payment (credit card) - no depositor/name
    const isUnifiedPayment = csvTx.paymentMethod?.toLowerCase() === "credit card";
    
    if (isUnifiedPayment) {
      // Unified payments (credit card) only need date + value match
      confidence += 40; // Full points since we can't check name
      reasons.push("Unified payment (credit card) - date & value match");
    } else {
      // Calculate name similarity for Zelle/other payments
      let nameSimilarity = 0;
      let nameSource = "";

      // Check depositor vs client name
      if (csvTx.depositor && sheetTx.name) {
        const depositorVsName = getNameSimilarity(csvTx.depositor, sheetTx.name);
        console.log(`[RECONCILE] Depositor "${csvTx.depositor}" vs Client "${sheetTx.name}" = ${depositorVsName}%`);
        if (depositorVsName > nameSimilarity) {
          nameSimilarity = depositorVsName;
          nameSource = "depositor vs client name";
        }
      }

      // Check depositor vs depositor
      if (csvTx.depositor && sheetTx.depositor) {
        const depositorVsDepositor = getNameSimilarity(csvTx.depositor, sheetTx.depositor);
        console.log(`[RECONCILE] Depositor "${csvTx.depositor}" vs Depositor "${sheetTx.depositor}" = ${depositorVsDepositor}%`);
        if (depositorVsDepositor > nameSimilarity) {
          nameSimilarity = depositorVsDepositor;
          nameSource = "depositor vs depositor";
        }
      }

      // Check name vs client name
      if (csvTx.name && sheetTx.name) {
        const nameVsName = getNameSimilarity(csvTx.name, sheetTx.name);
        console.log(`[RECONCILE] Name "${csvTx.name}" vs Client "${sheetTx.name}" = ${nameVsName}%`);
        if (nameVsName > nameSimilarity) {
          nameSimilarity = nameVsName;
          nameSource = "name vs client name";
        }
      }

      // REQUIRED: Must have at least 50% name similarity for non-unified payments
      if (nameSimilarity < 50) {
        console.log(`[RECONCILE] ❌ REJECTED: Name similarity ${nameSimilarity}% < 50% (date match, value match, but name failed)`);
        continue; // Skip if name similarity is less than 50%
      }

      // Add name similarity to confidence (0-40 points based on similarity)
      const namePoints = Math.round((nameSimilarity / 100) * 40);
      confidence += namePoints;
      reasons.push(`Name similarity: ${nameSimilarity}% (${nameSource})`);
      console.log(`[RECONCILE] ✅ MATCHED: Confidence=${confidence}, Name similarity=${nameSimilarity}% (${nameSource})`);
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
