import { Request, Response, NextFunction } from 'express';
import * as transactionService from '../services/transaction.service';
import { DepositInput, TransferInput, WithdrawInput } from '../schemas/wallet.schema';
import { PaginationQuery } from '../schemas/common.schema';

export const deposit = async (req: Request<{}, {}, DepositInput>, res: Response, next: NextFunction) => {
  try {
    const { amount, currency_code, description } = req.body;
    const result = await transactionService.depositFunds(req.user!.id, amount, currency_code, description);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const withdraw = async (req: Request<{}, {}, WithdrawInput>, res: Response, next: NextFunction) => {
  try {
    const { amount, currency_code, description } = req.body;
    const result = await transactionService.withdrawFunds(req.user!.id, amount, currency_code, description);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const transfer = async (req: Request<{}, {}, TransferInput>, res: Response, next: NextFunction) => {
  try {
    const { to_identifier, amount, currency_code, description } = req.body;
    const result = await transactionService.transferFunds(req.user!.id, to_identifier, amount, currency_code, description);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as unknown as PaginationQuery;
    const result = await transactionService.getTransactionHistory(req.user!.id, page, limit);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
