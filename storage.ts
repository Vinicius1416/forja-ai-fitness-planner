import type { UserData, Profile } from './types';

/**
 * Persistência LOCAL (navegador) — demonstração.
 * Os dados ficam em localStorage: não sincronizam entre dispositivos e
 * podem ser perdidos se o usuário limpar os dados do navegador.
 */

const USERS_KEY = 'forja_users';
const SESSION_KEY = 'forja_session';

export interface StoredUser {
  name: string;
  email: string;
  passHash: string;
  createdAt: string;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`forja::${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getUsers(): Record<string, StoredUser> {
  return readJSON<Record<string, StoredUser>>(USERS_KEY, {});
}

export function findUser(email: string): StoredUser | undefined {
  return getUsers()[email.toLowerCase()];
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const key = email.toLowerCase();
  const users = getUsers();
  if (users[key]) return { ok: false, error: 'Já existe uma conta com este e-mail.' };
  if (password.length < 6)
    return { ok: false, error: 'A senha precisa ter ao menos 6 caracteres.' };
  users[key] = {
    name: name.trim(),
    email: key,
    passHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  writeJSON(USERS_KEY, users);
  localStorage.setItem(SESSION_KEY, key);
  return { ok: true };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const user = findUser(email);
  if (!user) return { ok: false, error: 'Conta não encontrada. Cadastre-se primeiro.' };
  const hash = await hashPassword(password);
  if (hash !== user.passHash) return { ok: false, error: 'Senha incorreta. Tente novamente.' };
  localStorage.setItem(SESSION_KEY, user.email);
  return { ok: true };
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function currentSessionEmail(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function dataKey(email: string) {
  return `forja_data_${email.toLowerCase()}`;
}

export function emptyUserData(profile: Profile): UserData {
  return {
    profile,
    plan: null,
    photos: [],
    weights: [],
    nutrition: [],
    chat: [],
    completions: {},
    xp: 0,
  };
}

export function loadUserData(email: string): UserData | null {
  const raw = readJSON<UserData | null>(dataKey(email), null);
  return raw;
}

export function saveUserData(email: string, data: UserData) {
  try {
    writeJSON(dataKey(email), data);
    return true;
  } catch {
    // Quota excedida (fotos grandes) — tenta re-salvar sem as fotos antigas mais pesadas
    try {
      const slim: UserData = {
        ...data,
        photos: data.photos.slice(-4),
      };
      writeJSON(dataKey(email), slim);
      return false; // salvou parcial
    } catch {
      return false;
    }
  }
}

export function deleteAccount(email: string) {
  const users = getUsers();
  delete users[email.toLowerCase()];
  writeJSON(USERS_KEY, users);
  localStorage.removeItem(dataKey(email));
  logoutUser();
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
