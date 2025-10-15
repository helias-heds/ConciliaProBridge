import { type User, type InsertUser, type Transaction, type InsertTransaction, type GoogleSheetsConnection, type InsertGoogleSheetsConnection } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { transactions, googleSheetsConnections } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createTransactions(transactions: InsertTransaction[]): Promise<Transaction[]>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;
  
  getGoogleSheetsConnection(): Promise<GoogleSheetsConnection | undefined>;
  saveGoogleSheetsConnection(connection: InsertGoogleSheetsConnection): Promise<GoogleSheetsConnection>;
  updateGoogleSheetsConnection(id: string, updates: Partial<GoogleSheetsConnection>): Promise<GoogleSheetsConnection | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private transactions: Map<string, Transaction>;
  private googleSheetsConnection: GoogleSheetsConnection | undefined;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.googleSheetsConnection = undefined;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      id,
      date: insertTransaction.date,
      name: insertTransaction.name,
      value: insertTransaction.value,
      status: insertTransaction.status || "pending-ledger",
      car: insertTransaction.car ?? null,
      depositor: insertTransaction.depositor ?? null,
      confidence: insertTransaction.confidence ?? null,
      source: insertTransaction.source ?? null,
      paymentMethod: insertTransaction.paymentMethod ?? null,
      matchedTransactionId: insertTransaction.matchedTransactionId ?? null,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async createTransactions(insertTransactions: InsertTransaction[]): Promise<Transaction[]> {
    const created: Transaction[] = [];
    for (const insertTransaction of insertTransactions) {
      const transaction = await this.createTransaction(insertTransaction);
      created.push(transaction);
    }
    return created;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existing = this.transactions.get(id);
    if (!existing) return undefined;

    const updated: Transaction = {
      ...existing,
      ...updates,
    };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  async getGoogleSheetsConnection(): Promise<GoogleSheetsConnection | undefined> {
    return this.googleSheetsConnection;
  }

  async saveGoogleSheetsConnection(insertConnection: InsertGoogleSheetsConnection): Promise<GoogleSheetsConnection> {
    const id = randomUUID();
    const connection: GoogleSheetsConnection = {
      id,
      apiKey: insertConnection.apiKey,
      sheetUrl: insertConnection.sheetUrl,
      sheetId: insertConnection.sheetId ?? null,
      lastImportDate: insertConnection.lastImportDate ?? null,
      lastImportCount: insertConnection.lastImportCount ?? null,
      status: insertConnection.status || "connected",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.googleSheetsConnection = connection;
    return connection;
  }

  async updateGoogleSheetsConnection(id: string, updates: Partial<GoogleSheetsConnection>): Promise<GoogleSheetsConnection | undefined> {
    if (!this.googleSheetsConnection || this.googleSheetsConnection.id !== id) {
      return undefined;
    }

    this.googleSheetsConnection = {
      ...this.googleSheetsConnection,
      ...updates,
      updatedAt: new Date(),
    };

    return this.googleSheetsConnection;
  }
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    throw new Error("User management not implemented yet");
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    throw new Error("User management not implemented yet");
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    throw new Error("User management not implemented yet");
  }

  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const results = await db.select().from(transactions).where(eq(transactions.id, id));
    return results[0];
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const results = await db.insert(transactions).values(insertTransaction).returning();
    return results[0];
  }

  async createTransactions(insertTransactions: InsertTransaction[]): Promise<Transaction[]> {
    if (insertTransactions.length === 0) return [];
    
    // PostgreSQL has a parameter limit (~65,535), so we batch insert in chunks
    const BATCH_SIZE = 1000;
    const allResults: Transaction[] = [];
    
    for (let i = 0; i < insertTransactions.length; i += BATCH_SIZE) {
      const batch = insertTransactions.slice(i, i + BATCH_SIZE);
      const results = await db.insert(transactions).values(batch).returning();
      allResults.push(...results);
    }
    
    return allResults;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const results = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return results[0];
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const results = await db.delete(transactions).where(eq(transactions.id, id)).returning();
    return results.length > 0;
  }

  async getGoogleSheetsConnection(): Promise<GoogleSheetsConnection | undefined> {
    const results = await db.select().from(googleSheetsConnections).limit(1);
    return results[0];
  }

  async saveGoogleSheetsConnection(insertConnection: InsertGoogleSheetsConnection): Promise<GoogleSheetsConnection> {
    // Delete existing connection first (we only support one)
    await db.delete(googleSheetsConnections);
    
    const results = await db
      .insert(googleSheetsConnections)
      .values(insertConnection)
      .returning();
    return results[0];
  }

  async updateGoogleSheetsConnection(id: string, updates: Partial<GoogleSheetsConnection>): Promise<GoogleSheetsConnection | undefined> {
    const results = await db
      .update(googleSheetsConnections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(googleSheetsConnections.id, id))
      .returning();
    return results[0];
  }
}

export const storage = new DbStorage();
