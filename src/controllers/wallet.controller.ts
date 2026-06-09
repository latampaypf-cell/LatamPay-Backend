import { Request, Response, NextFunction } from 'express';
import * as walletService from '../services/wallet.service';
import { AppError } from '../utils/AppError';

export const getWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const wallet = await walletService.getWalletData(userId);
    res.json({ status: 'success', data: wallet });
  } catch (error) {
    next(error);
  }
};

export const lookupRecipient = async (req: Request<{ identifier: string }> , res: Response, next: NextFunction) => {
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

export const getContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const contacts = await walletService.getRecentContacts(userId);
    res.json({ status: 'success', data: contacts });
  } catch (error) {
    next(error);
  }
};
