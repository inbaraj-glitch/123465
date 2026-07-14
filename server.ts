/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Auto-create directories on startup
const DIRECTORIES = ["database", "uploads", "reports", "exports", "assets", "pages", "logs"];
DIRECTORIES.forEach((dir) => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const DB_PATH = path.join(process.cwd(), "database", "db.json");

// Initialize File-based database
interface DatabaseSchema {
  users: any[];
  transactions: any[];
  budgets: any[];
  bills: any[];
  investments: any[];
  chatHistory: any[];
}

const defaultDb: DatabaseSchema = {
  users: [],
  transactions: [],
  budgets: [],
  bills: [],
  investments: [],
  chatHistory: [],
};

function readDb(): DatabaseSchema {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2));
    return defaultDb;
  }
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, resetting:", err);
    return defaultDb;
  }
}

function writeDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Password hashing helper
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex");
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex");
  return hash === checkHash;
}

// Auto-categorize helper
function categorizeMerchant(merchant: string): string {
  const m = merchant.toLowerCase();
  if (m.includes("swiggy") || m.includes("zomato") || m.includes("starbucks") || m.includes("mcd") || m.includes("burger") || m.includes("restaurant") || m.includes("dining") || m.includes("food") || m.includes("cafe")) {
    return "Food & Dining";
  }
  if (m.includes("amazon") || m.includes("flipkart") || m.includes("myntra") || m.includes("zara") || m.includes("shopping") || m.includes("mall") || m.includes("store")) {
    return "Shopping";
  }
  if (m.includes("uber") || m.includes("ola") || m.includes("metro") || m.includes("fuel") || m.includes("petrol") || m.includes("shell") || m.includes("hpcl") || m.includes("iocl") || m.includes("cab") || m.includes("auto")) {
    return "Transport";
  }
  if (m.includes("netflix") || m.includes("spotify") || m.includes("prime") || m.includes("hotstar") || m.includes("youtube") || m.includes("entertainment") || m.includes("music") || m.includes("show")) {
    return "Entertainment";
  }
  if (m.includes("rent") || m.includes("landlord") || m.includes("maintenance") || m.includes("flat") || m.includes("pg") || m.includes("housing")) {
    return "Housing";
  }
  if (m.includes("salary") || m.includes("employer") || m.includes("payroll") || m.includes("bonus") || m.includes("dividend")) {
    return "Income";
  }
  if (m.includes("zerodha") || m.includes("groww") || m.includes("angel") || m.includes("mutual") || m.includes("sip") || m.includes("stocks") || m.includes("investment")) {
    return "Investments";
  }
  if (m.includes("tata power") || m.includes("electricity") || m.includes("bescom") || m.includes("airtel") || m.includes("jio") || m.includes("fibernet") || m.includes("act") || m.includes("bill") || m.includes("recharge") || m.includes("utilities")) {
    return "Utilities";
  }
  if (m.includes("hdfc credit") || m.includes("sbi credit") || m.includes("icici credit") || m.includes("card payment") || m.includes("emi")) {
    return "Credit Card Payment";
  }
  if (m.includes("apollo") || m.includes("pharmacy") || m.includes("hospital") || m.includes("medical") || m.includes("doctor") || m.includes("medicine")) {
    return "Healthcare";
  }
  return "Others";
}

// Generate realistic Indian seeding data for a user
function seedUserData(userId: string) {
  const db = readDb();

  // 1. Seed Budgets
  const categories = [
    { category: "Food & Dining", limitAmount: 15000 },
    { category: "Shopping", limitAmount: 12000 },
    { category: "Transport", limitAmount: 6000 },
    { category: "Entertainment", limitAmount: 5000 },
    { category: "Utilities", limitAmount: 8000 },
    { category: "Healthcare", limitAmount: 4000 },
  ];
  categories.forEach((cat) => {
    db.budgets.push({
      id: crypto.randomUUID(),
      userId,
      category: cat.category,
      limitAmount: cat.limitAmount,
      spentAmount: 0,
    });
  });

  // 2. Seed Bills
  const billsList = [
    { title: "Tata Power Electricity", category: "Utilities", amount: 2450, dueDate: "2026-07-20", status: "unpaid" },
    { title: "Airtel Xstream Fibernet", category: "Utilities", amount: 999, dueDate: "2026-07-18", status: "unpaid" },
    { title: "HDFC Credit Card Bill", category: "Credit Card Payment", amount: 14850, dueDate: "2026-07-25", status: "unpaid" },
    { title: "Apartment Maintenance", category: "Housing", amount: 4500, dueDate: "2026-07-15", status: "unpaid" },
    { title: "Rent Transfer", category: "Housing", amount: 28000, dueDate: "2026-07-05", status: "paid" },
  ];
  billsList.forEach((bill) => {
    db.bills.push({
      id: crypto.randomUUID(),
      userId,
      title: bill.title,
      category: bill.category,
      amount: bill.amount,
      dueDate: bill.dueDate,
      status: bill.status,
    });
  });

  // 3. Seed Transactions for last 30 days
  const today = new Date();
  const merchantsList = [
    { name: "Zomato", category: "Food & Dining", type: "expense", amounts: [450, 680, 1200] },
    { name: "Swiggy", category: "Food & Dining", type: "expense", amounts: [350, 520, 890] },
    { name: "Amazon Pay Merchant", category: "Shopping", type: "expense", amounts: [1299, 599, 2499] },
    { name: "Swiggy Instamart", category: "Food & Dining", type: "expense", amounts: [820, 1140, 1540] },
    { name: "Myntra Shopping", category: "Shopping", type: "expense", amounts: [1899, 3200] },
    { name: "Uber India", category: "Transport", type: "expense", amounts: [320, 410, 280] },
    { name: "Ola Cab Ride", category: "Transport", type: "expense", amounts: [350, 480] },
    { name: "Shell Petrol Pump", category: "Transport", type: "expense", amounts: [2000, 1500] },
    { name: "Netflix Premium", category: "Entertainment", type: "expense", amounts: [649] },
    { name: "Spotify India", category: "Entertainment", type: "expense", amounts: [119] },
    { name: "Apollo Pharmacy", category: "Healthcare", type: "expense", amounts: [650, 1250] },
    { name: "Zerodha Mutual Fund SIP", category: "Investments", type: "expense", amounts: [15000] },
    { name: "Groww Stocks", category: "Investments", type: "expense", amounts: [10000] },
  ];

  // Income transactions
  const salaryDate = new Date(today);
  salaryDate.setDate(1); // 1st of current month
  db.transactions.push({
    id: crypto.randomUUID(),
    userId,
    date: salaryDate.toISOString().split("T")[0],
    merchant: "Tech Corp India Salary",
    category: "Income",
    amount: 125000,
    type: "income",
    status: "completed",
    source: "upload",
    month: salaryDate.toISOString().split("T")[0].substring(0, 7),
    year: salaryDate.getFullYear(),
    quarter: Math.ceil((salaryDate.getMonth() + 1) / 3),
    week: Math.ceil(salaryDate.getDate() / 7),
  });

  // Previous month's salary
  const prevSalaryDate = new Date(salaryDate);
  prevSalaryDate.setMonth(prevSalaryDate.getMonth() - 1);
  db.transactions.push({
    id: crypto.randomUUID(),
    userId,
    date: prevSalaryDate.toISOString().split("T")[0],
    merchant: "Tech Corp India Salary",
    category: "Income",
    amount: 125000,
    type: "income",
    status: "completed",
    source: "upload",
    month: prevSalaryDate.toISOString().split("T")[0].substring(0, 7),
    year: prevSalaryDate.getFullYear(),
    quarter: Math.ceil((prevSalaryDate.getMonth() + 1) / 3),
    week: Math.ceil(prevSalaryDate.getDate() / 7),
  });

  // Paid Rent
  const rentDate = new Date(today);
  rentDate.setDate(5);
  db.transactions.push({
    id: crypto.randomUUID(),
    userId,
    date: rentDate.toISOString().split("T")[0],
    merchant: "HDFC NetBanking Rent Transfer",
    category: "Housing",
    amount: 28000,
    type: "expense",
    status: "completed",
    source: "manual",
    month: rentDate.toISOString().split("T")[0].substring(0, 7),
    year: rentDate.getFullYear(),
    quarter: Math.ceil((rentDate.getMonth() + 1) / 3),
    week: Math.ceil(rentDate.getDate() / 7),
  });

  // Generate 25 other random transactions spread out in the last 30 days
  for (let i = 0; i < 25; i++) {
    const txDate = new Date(today);
    txDate.setDate(today.getDate() - Math.floor(Math.random() * 30) - 1);

    const m = merchantsList[Math.floor(Math.random() * merchantsList.length)];
    const amt = m.amounts[Math.floor(Math.random() * m.amounts.length)];

    db.transactions.push({
      id: crypto.randomUUID(),
      userId,
      date: txDate.toISOString().split("T")[0],
      merchant: m.name,
      category: m.category,
      amount: amt,
      type: m.type,
      status: "completed",
      source: i % 3 === 0 ? "manual" : "upload",
      month: txDate.toISOString().split("T")[0].substring(0, 7),
      year: txDate.getFullYear(),
      quarter: Math.ceil((txDate.getMonth() + 1) / 3),
      week: Math.ceil(txDate.getDate() / 7),
    });
  }

  // Calculate budget spending
  db.budgets.forEach((b) => {
    if (b.userId === userId) {
      const spent = db.transactions
        .filter((t) => t.userId === userId && t.category === b.category && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      b.spentAmount = spent;
    }
  });

  // Seed default investment profile
  db.investments.push({
    id: crypto.randomUUID(),
    userId,
    age: 28,
    monthlySavings: 35000,
    riskProfile: "moderate",
    investmentGoal: "Wealth Creation & Tax Saving",
    emergencyFundMonths: 6,
    durationYears: 10,
  });

  writeDb(db);
}

// Enable standard express middleware
app.use(express.json({ limit: "10mb" }));

// Mock session - simple header authorization for easy iframe support!
// If authorization header exists, parse it as the user id.
let activeUser: any = null;

app.use((req, res, next) => {
  const userId = req.headers["authorization"];
  if (userId) {
    const db = readDb();
    const user = db.users.find((u) => u.id === userId);
    if (user) {
      activeUser = user;
    } else {
      activeUser = null;
    }
  } else {
    activeUser = null;
  }
  next();
});

// Auth API Endpoints
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const db = readDb();
  if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const { hash, salt } = hashPassword(password);
  const newUser = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: hash,
    salt,
    premiumBadge: false,
    memberSince: new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
  };

  db.users.push(newUser);
  writeDb(db);

  // Seed data immediately
  seedUserData(newUser.id);

  res.json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    premiumBadge: newUser.premiumBadge,
    memberSince: newUser.memberSince,
    avatarUrl: newUser.avatarUrl,
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    premiumBadge: user.premiumBadge,
    memberSince: user.memberSince,
    avatarUrl: user.avatarUrl,
  });
});

app.get("/api/auth/me", (req, res) => {
  if (!activeUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(activeUser);
});

// Update profile setting / Premium Upgrade
app.post("/api/auth/upgrade", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const db = readDb();
  const u = db.users.find((user) => user.id === activeUser.id);
  if (u) {
    u.premiumBadge = true;
    writeDb(db);
    return res.json(u);
  }
  res.status(404).json({ error: "User not found" });
});

// Transactions API Endpoints
app.get("/api/transactions", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const db = readDb();
  const userTransactions = db.transactions.filter((t) => t.userId === activeUser.id);
  res.json(userTransactions);
});

app.post("/api/transactions", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const { date, merchant, amount, type, status, category } = req.body;
  if (!date || !merchant || !amount || !type) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const txDate = new Date(date);
  const resolvedCategory = category || categorizeMerchant(merchant);

  const newTx = {
    id: crypto.randomUUID(),
    userId: activeUser.id,
    date,
    merchant,
    category: resolvedCategory,
    amount: Number(amount),
    type,
    status: status || "completed",
    source: "manual" as const,
    month: date.substring(0, 7),
    year: txDate.getFullYear(),
    quarter: Math.ceil((txDate.getMonth() + 1) / 3),
    week: Math.ceil(txDate.getDate() / 7),
  };

  const db = readDb();
  db.transactions.push(newTx);

  // Update budget spent amount
  if (type === "expense") {
    const budget = db.budgets.find((b) => b.userId === activeUser.id && b.category === resolvedCategory);
    if (budget) {
      budget.spentAmount += Number(amount);
    }
  }

  writeDb(db);
  res.json(newTx);
});

app.post("/api/transactions/upload", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const { fileContent, fileName } = req.body;
  if (!fileContent) {
    return res.status(400).json({ error: "No file content uploaded" });
  }

  // Simple CSV parser & cleaner
  const lines = fileContent.split(/\r?\n/);
  if (lines.length < 2) {
    return res.status(400).json({ error: "CSV file is empty or invalid" });
  }

  // Parse headers & build mapping
  const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase());
  const dateIdx = headers.findIndex((h: string) => h.includes("date") || h.includes("time"));
  const descIdx = headers.findIndex((h: string) => h.includes("desc") || h.includes("merchant") || h.includes("particular") || h.includes("narration") || h.includes("payee"));
  const amtIdx = headers.findIndex((h: string) => h.includes("amount") || h.includes("value") || h.includes("spent") || h.includes("tx"));
  const typeIdx = headers.findIndex((h: string) => h.includes("type") || h.includes("cr/dr") || h.includes("credit") || h.includes("debit"));

  if (dateIdx === -1 || descIdx === -1 || amtIdx === -1) {
    return res.status(400).json({
      error: "Columns could not be auto-mapped. CSV must contain columns for 'Date', 'Description/Merchant', and 'Amount'.",
    });
  }

  const db = readDb();
  const parsedTxList: any[] = [];
  let duplicatesCount = 0;

  // Process rows
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    // Handle simple quoted CSV strings
    const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c: string) => c.replace(/^"|"$/g, "").trim());

    if (cols.length <= Math.max(dateIdx, descIdx, amtIdx)) continue;

    const rawDate = cols[dateIdx];
    const rawDesc = cols[descIdx];
    const rawAmt = parseFloat(cols[amtIdx].replace(/[^0-9.-]/g, ""));
    let rawType = "expense";

    if (isNaN(rawAmt)) continue;

    if (typeIdx !== -1) {
      const typeVal = cols[typeIdx].toLowerCase();
      if (typeVal.includes("credit") || typeVal.includes("cr") || typeVal.includes("in") || typeVal.includes("income")) {
        rawType = "income";
      }
    } else {
      // Infers income if amount is positive and contains words like 'Salary', 'Dividend'
      const lowerDesc = rawDesc.toLowerCase();
      if (rawAmt > 0 && (lowerDesc.includes("salary") || lowerDesc.includes("dividend") || lowerDesc.includes("refund") || lowerDesc.includes("cashback") || lowerDesc.includes("credit"))) {
        rawType = "income";
      } else if (rawAmt < 0) {
        rawType = "expense";
      }
    }

    const absAmount = Math.abs(rawAmt);

    // Normalize Date
    let parsedDateStr = new Date().toISOString().split("T")[0];
    try {
      // Try parsing DD/MM/YYYY or MM/DD/YYYY or YYYY-MM-DD
      const dateParts = rawDate.split(/[-/.]/);
      if (dateParts.length === 3) {
        if (dateParts[2].length === 4) {
          // DD/MM/YYYY or MM/DD/YYYY. Defaulting to Indian standard DD/MM/YYYY
          const d = parseInt(dateParts[0]);
          const m = parseInt(dateParts[1]) - 1;
          const y = parseInt(dateParts[2]);
          parsedDateStr = new Date(y, m, d).toISOString().split("T")[0];
        } else if (dateParts[0].length === 4) {
          // YYYY-MM-DD
          parsedDateStr = new Date(rawDate).toISOString().split("T")[0];
        }
      } else {
        parsedDateStr = new Date(rawDate).toISOString().split("T")[0];
      }
    } catch (e) {
      // Failback to today
    }

    // Cleaner: Normalize merchant names (remove transaction IDs, codes, UPI suffixes)
    let cleanMerchant = rawDesc
      .replace(/UPI-.*?-/gi, "")
      .replace(/FT-.*?-/gi, "")
      .replace(/IMPS-.*?-/gi, "")
      .replace(/\s\s+/g, " ")
      .trim();
    if (cleanMerchant.length > 40) {
      cleanMerchant = cleanMerchant.substring(0, 40) + "...";
    }

    const resolvedCategory = categorizeMerchant(cleanMerchant);

    // Duplicate detection (same date, merchant, amount, type)
    const exists = db.transactions.some(
      (t) => t.userId === activeUser.id && t.date === parsedDateStr && t.merchant.toLowerCase() === cleanMerchant.toLowerCase() && t.amount === absAmount && t.type === rawType
    );

    if (exists) {
      duplicatesCount++;
      continue;
    }

    const txDate = new Date(parsedDateStr);
    const newTx = {
      id: crypto.randomUUID(),
      userId: activeUser.id,
      date: parsedDateStr,
      merchant: cleanMerchant,
      category: resolvedCategory,
      amount: absAmount,
      type: rawType,
      status: "completed",
      source: "upload" as const,
      month: parsedDateStr.substring(0, 7),
      year: txDate.getFullYear(),
      quarter: Math.ceil((txDate.getMonth() + 1) / 3),
      week: Math.ceil(txDate.getDate() / 7),
    };

    parsedTxList.push(newTx);
    db.transactions.push(newTx);

    // Update budget progress
    if (rawType === "expense") {
      const budget = db.budgets.find((b) => b.userId === activeUser.id && b.category === resolvedCategory);
      if (budget) {
        budget.spentAmount += absAmount;
      }
    }
  }

  writeDb(db);
  res.json({
    message: `Successfully cleaned, validated, and imported ${parsedTxList.length} transactions.`,
    importedCount: parsedTxList.length,
    duplicatesSkipped: duplicatesCount,
    transactions: parsedTxList,
  });
});

app.post("/api/transactions/recategorize", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const { id, category } = req.body;
  if (!id || !category) return res.status(400).json({ error: "Missing fields" });

  const db = readDb();
  const tx = db.transactions.find((t) => t.id === id && t.userId === activeUser.id);
  if (!tx) return res.status(404).json({ error: "Transaction not found" });

  const oldCategory = tx.category;
  tx.category = category;

  // Recalculate budgets for old and new category
  if (tx.type === "expense") {
    const oldBudget = db.budgets.find((b) => b.userId === activeUser.id && b.category === oldCategory);
    if (oldBudget) oldBudget.spentAmount = Math.max(0, oldBudget.spentAmount - tx.amount);

    const newBudget = db.budgets.find((b) => b.userId === activeUser.id && b.category === category);
    if (newBudget) newBudget.spentAmount += tx.amount;
  }

  writeDb(db);
  res.json(tx);
});

// Budgets API Endpoints
app.get("/api/budgets", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const db = readDb();
  const userBudgets = db.budgets.filter((b) => b.userId === activeUser.id);
  res.json(userBudgets);
});

app.post("/api/budgets", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const { category, limitAmount } = req.body;
  if (!category || !limitAmount) return res.status(400).json({ error: "Missing fields" });

  const db = readDb();
  let budget = db.budgets.find((b) => b.userId === activeUser.id && b.category === category);

  // Calculate current spent
  const spent = db.transactions
    .filter((t) => t.userId === activeUser.id && t.category === category && t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  if (budget) {
    budget.limitAmount = Number(limitAmount);
    budget.spentAmount = spent;
  } else {
    budget = {
      id: crypto.randomUUID(),
      userId: activeUser.id,
      category,
      limitAmount: Number(limitAmount),
      spentAmount: spent,
    };
    db.budgets.push(budget);
  }

  writeDb(db);
  res.json(budget);
});

// Bills API Endpoints
app.get("/api/bills", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const db = readDb();
  const userBills = db.bills.filter((b) => b.userId === activeUser.id);
  res.json(userBills);
});

app.post("/api/bills", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const { title, category, amount, dueDate } = req.body;
  if (!title || !category || !amount || !dueDate) return res.status(400).json({ error: "Missing fields" });

  const newBill = {
    id: crypto.randomUUID(),
    userId: activeUser.id,
    title,
    category,
    amount: Number(amount),
    dueDate,
    status: "unpaid" as const,
  };

  const db = readDb();
  db.bills.push(newBill);
  writeDb(db);
  res.json(newBill);
});

app.post("/api/bills/pay", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });

  const db = readDb();
  const bill = db.bills.find((b) => b.id === id && b.userId === activeUser.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  bill.status = "paid";

  // Create auto transaction for this payment
  const txDate = new Date();
  const dateStr = txDate.toISOString().split("T")[0];
  const newTx = {
    id: crypto.randomUUID(),
    userId: activeUser.id,
    date: dateStr,
    merchant: `Paid: ${bill.title}`,
    category: bill.category,
    amount: bill.amount,
    type: "expense" as const,
    status: "completed" as const,
    source: "manual" as const,
    month: dateStr.substring(0, 7),
    year: txDate.getFullYear(),
    quarter: Math.ceil((txDate.getMonth() + 1) / 3),
    week: Math.ceil(txDate.getDate() / 7),
  };

  db.transactions.push(newTx);

  // Update budget
  const budget = db.budgets.find((b) => b.userId === activeUser.id && b.category === bill.category);
  if (budget) {
    budget.spentAmount += bill.amount;
  }

  writeDb(db);
  res.json({ bill, transaction: newTx });
});

// Investment Profile Endpoints
app.get("/api/investment-profile", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const db = readDb();
  let prof = db.investments.find((i) => i.userId === activeUser.id);
  if (!prof) {
    prof = {
      id: crypto.randomUUID(),
      userId: activeUser.id,
      age: 28,
      monthlySavings: 30000,
      riskProfile: "moderate",
      investmentGoal: "Wealth Creation",
      emergencyFundMonths: 6,
      durationYears: 10,
    };
    db.investments.push(prof);
    writeDb(db);
  }
  res.json(prof);
});

app.post("/api/investment-profile", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const { age, monthlySavings, riskProfile, investmentGoal, emergencyFundMonths, durationYears } = req.body;

  const db = readDb();
  let prof = db.investments.find((i) => i.userId === activeUser.id);
  if (prof) {
    prof.age = Number(age);
    prof.monthlySavings = Number(monthlySavings);
    prof.riskProfile = riskProfile;
    prof.investmentGoal = investmentGoal;
    prof.emergencyFundMonths = Number(emergencyFundMonths);
    prof.durationYears = Number(durationYears);
  } else {
    prof = {
      id: crypto.randomUUID(),
      userId: activeUser.id,
      age: Number(age),
      monthlySavings: Number(monthlySavings),
      riskProfile,
      investmentGoal,
      emergencyFundMonths: Number(emergencyFundMonths),
      durationYears: Number(durationYears),
    };
    db.investments.push(prof);
  }
  writeDb(db);
  res.json(prof);
});

// Financial Health API
app.get("/api/health-score", (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });

  const db = readDb();
  const txs = db.transactions.filter((t) => t.userId === activeUser.id);
  const bills = db.bills.filter((b) => b.userId === activeUser.id);
  const budgets = db.budgets.filter((b) => b.userId === activeUser.id);

  const totalIncome = txs.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = txs.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  // Financial Metric Calculations
  const savings = totalIncome > totalExpense ? totalIncome - totalExpense : 0;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100;

  // Debt ratio simulation (based on bills like credit cards and loans)
  const creditCardBillsSum = bills.filter((b) => b.category.includes("Credit") || b.title.includes("EMI")).reduce((sum, b) => sum + b.amount, 0);
  const debtRatio = totalIncome > 0 ? (creditCardBillsSum / totalIncome) * 100 : 0;

  // Budget discipline (percentage of budgets not overspent)
  let disciplineScore = 100;
  if (budgets.length > 0) {
    const overspentCount = budgets.filter((b) => b.spentAmount > b.limitAmount).length;
    disciplineScore = Math.max(0, 100 - (overspentCount / budgets.length) * 100);
  }

  // Emergency Fund simulation
  const emergencyMonths = totalExpense > 0 ? (savings * 3) / (totalExpense / 2) : 0; // Simulated emergency funds in months
  const emergencyFundStatus = emergencyMonths >= 6 ? "Excellent (6+ Months)" : emergencyMonths >= 3 ? "Healthy (3-5 Months)" : "Critical (Under 3 Months)";

  // Calculate Overall Financial Health Score (0 - 100)
  // Weighted: 35% Savings Rate, 25% Budget Discipline, 20% Emergency Fund, 20% Bill Payment History
  const unpaidBillsCount = bills.filter((b) => b.status === "unpaid").length;
  const billScore = Math.max(0, 100 - unpaidBillsCount * 15);

  const savingsWeight = Math.min(100, savingsRate * 2.5); // 40% rate is perfect 100
  const emergencyWeight = Math.min(100, (emergencyMonths / 6) * 100);

  const score = Math.round(
    savingsWeight * 0.35 +
    disciplineScore * 0.25 +
    emergencyWeight * 0.2 +
    billScore * 0.2
  );

  let status: "Poor" | "Average" | "Good" | "Excellent" = "Good";
  if (score >= 80) status = "Excellent";
  else if (score >= 60) status = "Good";
  else if (score >= 40) status = "Average";
  else status = "Poor";

  const tips: string[] = [];
  if (savingsRate < 20) {
    tips.push("Your savings rate is currently low. Aim to save at least 20% of your monthly income.");
  } else {
    tips.push("Great job! Your savings rate is healthy. Consider deploying savings into automated SIPs.");
  }

  if (unpaidBillsCount > 0) {
    tips.push(`You have ${unpaidBillsCount} unpaid bills. Set up autopay to avoid overdue warnings.`);
  }

  if (budgets.some((b) => b.spentAmount > b.limitAmount)) {
    tips.push("Overspending detected on some categories. Review your Food & Shopping limits in the Budget page.");
  }

  if (emergencyMonths < 6) {
    tips.push("Your emergency fund buffer is below 6 months. Consider scaling back shopping expenses to boost reserves.");
  }

  res.json({
    score: Math.max(10, Math.min(100, score)),
    status,
    savingsRate: Math.round(savingsRate),
    expenseRatio: Math.round(expenseRatio),
    debtRatio: Math.round(debtRatio),
    budgetDiscipline: Math.round(disciplineScore),
    emergencyFundStatus,
    tips,
  });
});

// Gemini Client Utility Helper
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY environment variable is not defined");
      return null;
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// AI spending insights endpoint using Gemini
app.get("/api/ai/insights", async (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });

  const db = readDb();
  const txs = db.transactions.filter((t) => t.userId === activeUser.id);
  const budgets = db.budgets.filter((b) => b.userId === activeUser.id);

  // Compute stats
  const totalIncome = txs.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = txs.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  // Spend breakdown
  const categorySpend: Record<string, number> = {};
  txs.filter((t) => t.type === "expense").forEach((t) => {
    categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
  });

  const ai = getGeminiClient();
  if (!ai) {
    // Fallback static recommendations if API key is not defined
    return res.json([
      {
        id: "1",
        type: "alert",
        title: "High Shopping Expenses",
        description: "You've spent ₹8,420 more than normal on shopping this month. Consider checking your Amazon habits.",
        amount: 8420,
      },
      {
        id: "2",
        type: "saving",
        title: "Potential SIP Boost",
        description: "Based on your current balance, you can save ₹4,200 next month by reducing dining orders. Increasing your SIP would gain tax benefits under Section 80C.",
        amount: 4200,
      },
      {
        id: "3",
        type: "recommendation",
        title: "Build Emergency Reserves",
        description: "Maintain an emergency fund of at least 6 months (approx ₹1,20,000) before expanding high-risk equity mutual funds.",
      },
    ]);
  }

  try {
    const prompt = `You are FinGuard AI, an elite personal finance intelligence system for Indian banking users.
Review the following user financial metrics and generate exactly 3 highly customized, professional, and actionable financial insights or alert recommendations in JSON format. Do not write markdown text outside the JSON.

User Stats:
- Total Monthly Income: ₹${totalIncome}
- Total Monthly Expenses: ₹${totalExpense}
- Savings: ₹${totalIncome - totalExpense}
- Category Expenses: ${JSON.stringify(categorySpend)}
- Budgets: ${JSON.stringify(budgets)}

Provide the response as a JSON array of 3 objects, where each object has:
{
  "id": "string (unique)",
  "type": "alert" | "saving" | "recommendation" | "general",
  "title": "short premium heading",
  "description": "very specific description customized to the user's spending habits (mention Indian financial context where relevant)",
  "amount": number (optional, estimated potential saving or overspent amount in ₹)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    const insights = JSON.parse(text);
    res.json(insights);
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    res.status(500).json({ error: "Failed to generate AI insights" });
  }
});

// AI Financial Chatbot endpoint using Gemini
app.post("/api/ai/chat", async (req, res) => {
  if (!activeUser) return res.status(401).json({ error: "Unauthorized" });
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message" });

  const db = readDb();
  const txs = db.transactions.filter((t) => t.userId === activeUser.id);
  const budgets = db.budgets.filter((b) => b.userId === activeUser.id);
  const bills = db.bills.filter((b) => b.userId === activeUser.id);

  // Extract recent transactions to give context to Gemini
  const summaryTxs = txs.slice(-15).map((t) => ({
    date: t.date,
    merchant: t.merchant,
    category: t.category,
    amount: t.amount,
    type: t.type,
  }));

  const totalIncome = txs.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = txs.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  const ai = getGeminiClient();
  if (!ai) {
    // Dynamic rule-based mock response if no Gemini API key
    let reply = "Hello! I am FinGuard AI, your financial assistant. Currently, I am running in local offline mode. How can I help you manage your budgets?";
    const msg = message.toLowerCase();
    if (msg.includes("spend") || msg.includes("expense") || msg.includes("food") || msg.includes("shopping")) {
      const foodSpend = txs.filter((t) => t.category === "Food & Dining" && t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
      reply = `Based on your records, your total expenses are ₹${totalExpense}. You have spent ₹${foodSpend} on Food & Dining. Your top transactions include Swiggy and Zomato. Let me know if you would like to set up a budget tracker!`;
    } else if (msg.includes("salary") || msg.includes("income") || msg.includes("earn")) {
      reply = `You received a total income of ₹${totalIncome} this month. This includes credits from 'Tech Corp India Salary'.`;
    } else if (msg.includes("save") || msg.includes("sip") || msg.includes("invest")) {
      reply = `To save more, consider setting up a Recurring Deposit (RD) or mutual fund SIP. Currently your savings rate is ${totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%. Let me know if you want detailed advice!`;
    }
    return res.json({ message: reply });
  }

  try {
    // Render previous messages for history context
    const previousTurns = (history || []).slice(-10).map((h: any) => ({
      role: h.sender === "user" ? "user" : "model",
      parts: [{ text: h.message }],
    }));

    // Inject system instructions and actual user financial context
    const systemInstruction = `You are FinGuard AI, an elite AI Wealth Architect, Personal Finance Intelligence Specialist, and Investment Advisory System.
You are helping the Indian user: ${activeUser.name} (${activeUser.email}).
Provide highly professional, precise, and polite finance coaching. Answer questions clearly using Indian Rupees (₹) format.

Your analysis MUST be grounded on the user's real transactions and records provided below:
- Total Income: ₹${totalIncome}
- Total Expenses: ₹${totalExpense}
- Current Savings Buffer: ₹${totalIncome - totalExpense}
- Budgets: ${JSON.stringify(budgets)}
- Bills: ${JSON.stringify(bills)}
- Recent Transaction History (Last 15): ${JSON.stringify(summaryTxs)}

If the user asks about specific spending, calculate the answers dynamically from this context. Do not invent fake transaction records if they ask for exact queries. If they ask generally about saving, give bespoke advice. Use elegant markdown styling. Keep answers concise, direct, and elite.`;

    const contents = [
      ...previousTurns,
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({ message: response.text });
  } catch (err) {
    console.error("Gemini Chat Error:", err);
    res.status(500).json({ error: "Failed to generate AI chat response" });
  }
});

// Serve client assets in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Vite dev middleware for development HMR
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    // Custom fallthrough route for SPA
    app.get("*", (req, res, next) => {
      // API endpoints should never match
      if (req.path.startsWith("/api/")) {
        return next();
      }
      const indexHtml = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
      res.status(200).set({ "Content-Type": "text/html" }).end(indexHtml);
    });
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FinGuard AI Server running on http://0.0.0.0:${PORT}`);
});
