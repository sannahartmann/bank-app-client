import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs';

const DB_FILE = './bank.db';
const INIT_FLAG_FILE = './db_initialized.flag';

export interface Account {
  id: number;
  name: string;
  availableCash: number;
}

export interface Transaction {
  id: number;
  registeredTime: number;
  executedTime: number;
  success: number;
  cashAmount: number;
  sourceAccountId: number;
  destinationAccountId: number;
}

const createTables = async (db: Database) => {
  await db.exec(`CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    availableCash REAL
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registeredTime INTEGER,
    executedTime INTEGER,
    success INTEGER,
    cashAmount REAL,
    sourceAccountId INTEGER,
    destinationAccountId INTEGER,
    FOREIGN KEY (sourceAccountId) REFERENCES accounts (id),
    FOREIGN KEY (destinationAccountId) REFERENCES accounts (id)
  )`);
};

const insertInitialAccounts = async (db: Database) => {
  const accounts: Omit<Account, 'id'>[] = [
    { name: 'Sanna', availableCash: 5000 },
    { name: 'Checking Account', availableCash: 2500 },
    { name: 'Investment Account', availableCash: 10000 },
    { name: 'Emergency Fund', availableCash: 3000 },
    { name: 'Travel Savings', availableCash: 1500 }
  ];

  for (const account of accounts) {
    await db.run(
      'INSERT OR IGNORE INTO accounts (name, availableCash) VALUES (?, ?)',
      [account.name, account.availableCash]
    );
  }
};

export const dbPromise = (async () => {
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });

  if (!fs.existsSync(INIT_FLAG_FILE)) {
    await createTables(db);
    await insertInitialAccounts(db);
    fs.writeFileSync(INIT_FLAG_FILE, 'initialized');
    console.log('Database initialized with tables and initial accounts.');
  } else {
    console.log('Database already initialized, skipping initialization process.');
  }

  return db;
})();