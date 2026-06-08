import { Request, Response, NextFunction } from 'express';
import * as walletService from '../services/wallet.service';
import * as transactionService from '../services/transaction.service';
import * as exchangeService from '../services/exchange.service';
import { AppError } from '../utils/AppError';

export const getWallet = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const wallet = await walletService.getWalletData(userId);
    res.json({ status: 'success', data: wallet });
  } catch (error) {
    next(error);
  }
};

export const lookupRecipient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.params;
    const recipient = await walletService.findRecipient(identifier);
    
    if (!recipient) {
      throw new AppError('No se encontró ningún usuario con ese CBU o Alias.', 404);
    }

    res.json({ status: 'success', data: recipient });
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const contacts = await walletService.getRecentContacts(userId);
    res.json({ status: 'success', data: contacts });
  } catch (error) {
    next(error);
  }
};

export const deposit = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await transactionService.depositFunds(req.user.id, req.body.amount, req.body.currency_code);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const withdraw = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await transactionService.withdrawFunds(req.user.id, req.body.amount, req.body.currency_code);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const swap = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { from_currency, to_currency, amount } = req.body;
    const result = await exchangeService.swapCurrency(req.user.id, from_currency, to_currency, amount);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const transfer = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { to_identifier, amount, currency_code } = req.body;
    const result = await transactionService.transferFunds(req.user.id, to_identifier, amount, currency_code);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await transactionService.getTransactionHistory(req.user.id, page, limit);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
