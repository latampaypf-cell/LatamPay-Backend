import { query } from '../db';

export const getWalletData = async (userId: string) => {
  const walletRes = await query(
    `SELECT w.id, w.cbu, w.alias, 
            COALESCE(json_agg(json_build_object('currency', b.currency_code, 'amount', b.amount)) FILTER (WHERE b.currency_code IS NOT NULL), '[]') as balances
     FROM wallets w
     LEFT JOIN balances b ON w.id = b.wallet_id
     WHERE w.user_id = $1
     GROUP BY w.id`,
    [userId]
  );
  return walletRes.rows[0];
};

/**
 * Busca un destinatario por CBU o Alias para validar antes de transferir.
 */
export const findRecipient = async (identifier: string) => {
  const result = await query(
    `SELECT u.name, w.cbu, w.alias 
     FROM wallets w 
     JOIN users u ON w.user_id = u.id 
     WHERE w.cbu = $1 OR w.alias = $1`,
    [identifier]
  );
  
  if (result.rows.length === 0) return null;
  return result.rows[0];
};

/**
 * Obtiene los contactos recientes (usuarios a los que se les ha transferido dinero).
 */
export const getRecentContacts = async (userId: string) => {
  const walletRes = await query('SELECT id FROM wallets WHERE user_id = $1', [userId]);
  if (walletRes.rows.length === 0) return [];
  const walletId = walletRes.rows[0].id;

  const result = await query(
    `SELECT DISTINCT u.name, w.cbu, w.alias
     FROM transactions t
     JOIN wallets w ON t.to_wallet_id = w.id
     JOIN users u ON w.user_id = u.id
     WHERE t.from_wallet_id = $1 AND t.type = 'transfer'
     ORDER BY u.name ASC
     LIMIT 10`,
    [walletId]
  );
  
  return result.rows;
};
