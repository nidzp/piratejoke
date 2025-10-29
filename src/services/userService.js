const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || '7d';

let supabaseClient = null;

function getSupabaseClient() {
  if (process.env.SUPABASE_DISABLED === 'true') {
    return null;
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    supabaseId: row.supabase_id || null,
    email: row.email,
    displayName: row.display_name,
    tokens: row.tokens,
    lastSearch: row.last_search || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getUserByEmail(email) {
  const row = db
    .prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
    .get(email);
  return mapUser(row);
}

function getUserWithPasswordByEmail(email) {
  return db
    .prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
    .get(email);
}

function getUserById(id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return mapUser(row);
}

async function createUser({ email, password, displayName }) {
  const existing = getUserByEmail(email);
  if (existing) {
    const error = new Error('Email already registered');
    error.code = 'EMAIL_IN_USE';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let supabaseId = null;
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      });
      if (error) {
        throw error;
      }
      supabaseId = data.user?.id || null;
    } catch (err) {
      console.warn('Supabase user creation failed:', err.message);
    }
  }

  const result = db
    .prepare(
      `
      INSERT INTO users (supabase_id, email, password_hash, display_name)
      VALUES (@supabaseId, @email, @passwordHash, @displayName)
      RETURNING *
    `
    )
    .get({ supabaseId, email, passwordHash, displayName });

  return mapUser(result);
}

async function verifyUserCredentials(email, password) {
  const row = getUserWithPasswordByEmail(email);
  if (!row) {
    return null;
  }

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    return null;
  }

  return mapUser(row);
}

function issueJwt(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.displayName,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function setLastSearch(userId, searchTerm) {
  db.prepare(
    `
      UPDATE users
        SET last_search = @searchTerm,
            updated_at = CURRENT_TIMESTAMP
      WHERE id = @userId
    `
  ).run({ userId, searchTerm });
}

function getLastSearch(userId) {
  const row = db.prepare('SELECT last_search FROM users WHERE id = ?').get(userId);
  return row?.last_search || null;
}

const deductTokensTx = db.transaction((userId, amount) => {
  const row = db.prepare('SELECT tokens FROM users WHERE id = ?').get(userId);
  if (!row) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (row.tokens < amount) {
    return { success: false, balance: row.tokens };
  }

  const updated = db
    .prepare(
      `
        UPDATE users
          SET tokens = tokens - @amount,
              updated_at = CURRENT_TIMESTAMP
        WHERE id = @userId
      `
    )
    .run({ userId, amount });

  if (updated.changes !== 1) {
    const error = new Error('Unable to update token balance');
    error.status = 500;
    throw error;
  }

  const after = db.prepare('SELECT tokens FROM users WHERE id = ?').get(userId);
  return { success: true, balance: after.tokens };
});

function deductTokens(userId, amount = 1) {
  return deductTokensTx(userId, amount);
}

function addTokens(userId, amount) {
  const result = db
    .prepare(
      `
        UPDATE users
          SET tokens = tokens + @amount,
              updated_at = CURRENT_TIMESTAMP
        WHERE id = @userId
      `
    )
    .run({ userId, amount });

  if (result.changes !== 1) {
    const error = new Error('Unable to update token balance');
    error.status = 500;
    throw error;
  }

  const row = db.prepare('SELECT tokens FROM users WHERE id = ?').get(userId);
  return row.tokens;
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  verifyUserCredentials,
  issueJwt,
  setLastSearch,
  getLastSearch,
  deductTokens,
  addTokens,
  JWT_SECRET,
};
