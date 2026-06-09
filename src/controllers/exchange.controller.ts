import { Request, Response, NextFunction } from 'express';
import { getStoredExchangeRates, syncExchangeRates, swapCurrency } from '../services/exchange.service';
import { SwapInput } from '../schemas/wallet.schema';

export const getRates = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rates = await getStoredExchangeRates();
    res.json({
      status: 'success',
      data: rates
    });
  } catch (error) {
    next(error);
  }
};

export const swap = async (req: Request<{}, {}, SwapInput>, res: Response, next: NextFunction) => {
  try {
    const { from_currency, to_currency, amount } = req.body;
    const result = await swapCurrency(req.user!.id, from_currency, to_currency, amount);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const triggerSync = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await syncExchangeRates();
    res.json({
      status: 'success',
      message: 'Sincronización de tasas iniciada.'
    });
  } catch (error) {
    next(error);
  }
};
