import { Request, Response, NextFunction } from 'express';
import { getStoredExchangeRates, syncExchangeRates } from '../services/exchange.service';

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
