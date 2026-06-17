import { Request, Response, NextFunction } from 'express';
import { getStoredExchangeRates, syncExchangeRates, swapCurrency, getExchangeHistory } from '../services/exchange.service';
import { SwapInput, ExchangeHistoryInput } from '../schemas/wallet.schema';

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

export const getHistory = async (req: Request<{}, {}, {}, ExchangeHistoryInput>, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query;
    const history = await getExchangeHistory(from, to);
    res.json({
      status: 'success',
      data: history
    });
  } catch (error) {
    next(error);
  }
};

export const swap = async (req: Request<{}, {}, SwapInput>, res: Response, next: NextFunction) => {
  try {
    const { from_currency, to_currency, amount, description } = req.body;
    const result = await swapCurrency(req.user!.id, from_currency, to_currency, amount, description);
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
