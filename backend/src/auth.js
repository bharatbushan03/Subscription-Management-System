import 'dotenv/config';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { supabase } from './supabase.js';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error('JWT_SECRET is required');

export async function registerUser({ name, email, password }) {
  if (!name || !email || !password || password.length < 8) {
    const error = new Error('Name, email, and a password of at least 8 characters are required');
    error.status = 400;
    throw error;
  }
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await argon2.hash(password);
  const result = await supabase.from('users').insert({
    name: name.trim(),
    email: normalizedEmail,
    password_hash: passwordHash
  }).select('id,name,email,role,created_at').single();
  if (result.error) {
    if (result.error.code === '23505') {
      const error = new Error('An account with this email already exists');
      error.status = 409;
      throw error;
    }
    throw result.error;
  }
  return result.data;
}

export async function loginUser({ email, password }) {
  const result = await supabase.from('users').select('id,name,email,password_hash,role').eq('email', email.trim().toLowerCase()).single();
  if (result.error || !(await argon2.verify(result.data.password_hash, password))) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }
  const user = { id: result.data.id, name: result.data.name, email: result.data.email, role: result.data.role };
  return { user, token: jwt.sign(user, jwtSecret, { expiresIn: '8h' }) };
}

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return next(Object.assign(new Error('Authentication required'), { status: 401 }));
  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return next(Object.assign(new Error('Invalid or expired token'), { status: 401 }));
  }
}
