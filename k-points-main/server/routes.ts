import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { googleSheetsService } from "./googleSheets";
import { insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/users/with-stats', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getUsersWithStats();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users with stats:", error);
      res.status(500).json({ message: "Failed to fetch users with stats" });
    }
  });

  // Transaction routes
  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Validate sender
      if (transactionData.senderId !== userId) {
        return res.status(403).json({ message: "Cannot send points for another user" });
      }

      // Check if sender has enough points
      const sender = await storage.getUser(transactionData.senderId);
      if (!sender || sender.pointBalance < transactionData.points) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      // Check daily limit
      const today = new Date().toISOString().split('T')[0];
      const dailyLimit = await storage.getDailyLimit(transactionData.senderId, today);
      if (dailyLimit && dailyLimit.sendCount >= 3) {
        return res.status(400).json({ message: "Daily sending limit reached" });
      }

      // Validate point amount (1-3 points)
      if (transactionData.points < 1 || transactionData.points > 3) {
        return res.status(400).json({ message: "Points must be between 1 and 3" });
      }

      // Check if sender and receiver are different
      if (transactionData.senderId === transactionData.receiverId) {
        return res.status(400).json({ message: "Cannot send points to yourself" });
      }

      // Get receiver
      const receiver = await storage.getUser(transactionData.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }

      // Create transaction
      const transaction = await storage.createTransaction(transactionData);

      // Update balances
      await storage.updateUserBalance(sender.id, sender.pointBalance - transactionData.points);
      await storage.updateUserBalance(receiver.id, receiver.pointBalance + transactionData.points);

      // Update daily limit
      await storage.updateDailyLimit(transactionData.senderId, today);

      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get('/api/transactions', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const transactions = await storage.getTransactionHistory(limit, offset);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get('/api/transactions/recent', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  app.get('/api/transactions/user/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = (req as any).user.claims.sub;
      
      // Users can only see their own transactions unless they're admin
      const currentUser = await storage.getUser(currentUserId);
      if (userId !== currentUserId && currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ message: "Failed to fetch user transactions" });
    }
  });

  // Department routes
  app.get('/api/departments', isAuthenticated, async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get('/api/departments/rankings', isAuthenticated, async (req, res) => {
    try {
      const rankings = await storage.getDepartmentRankings();
      res.json(rankings);
    } catch (error) {
      console.error("Error fetching department rankings:", error);
      res.status(500).json({ message: "Failed to fetch department rankings" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Google Sheets integration routes
  app.post('/api/admin/export/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      await googleSheetsService.exportTransactionHistory();
      res.json({ message: "Transaction history exported successfully" });
    } catch (error) {
      console.error("Error exporting transactions:", error);
      res.status(500).json({ message: "Failed to export transaction history" });
    }
  });

  app.post('/api/admin/export/balances', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      await googleSheetsService.exportUserBalances();
      res.json({ message: "User balances exported successfully" });
    } catch (error) {
      console.error("Error exporting balances:", error);
      res.status(500).json({ message: "Failed to export user balances" });
    }
  });

  app.post('/api/admin/import/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const result = await googleSheetsService.importUsers();
      res.json(result);
    } catch (error) {
      console.error("Error importing users:", error);
      res.status(500).json({ message: "Failed to import users" });
    }
  });

  app.post('/api/admin/reset-quarterly', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      await storage.resetQuarterlyPoints();
      res.json({ message: "Quarterly points reset successfully" });
    } catch (error) {
      console.error("Error resetting quarterly points:", error);
      res.status(500).json({ message: "Failed to reset quarterly points" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
