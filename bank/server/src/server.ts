import express, { Request, Response } from 'express';
import cors from 'cors';
import { dbPromise } from './db';
import { Account, Transaction } from './models';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/accounts', async (req: Request, res: Response) => {
  try {
    const accounts = await Account.getAll();
    res.status(200).json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/transactions', async (req: Request, res: Response) => {
  const { sourceAccountId, destinationAccountId, amount } = req.body;
  
  try {
    const accounts = await Account.getAll();
    const sourceAccount = accounts.find(a => a.id === sourceAccountId);
    const destinationAccount = accounts.find(a => a.id === destinationAccountId);

    if (!sourceAccount || !destinationAccount) {
      return res.status(400).json({ error: "Invalid account(s)" });
    }

    if (sourceAccount.availableCash < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    await Account.updateBalance(sourceAccountId, -amount);
    await Account.updateBalance(destinationAccountId, amount);
    const transactionId = await Transaction.create(sourceAccountId, destinationAccountId, amount);
    const transaction = await Transaction.getById(transactionId);

    if (transaction) {
      res.status(200).json({
        message: "Transaction successful",
        transaction: transaction
      });
    } else {
      res.status(500).json({ error: "Transaction created but could not be retrieved" });
    }
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

const PORT = process.env.PORT || 3001;

dbPromise.then(db => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});