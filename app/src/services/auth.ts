export interface User {
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

// Mock directory — demo credentials only. No real authentication in this prototype.
const USERS: (User & { password: string })[] = [
  { email: 'customer@demo.local', password: 'customer123', name: 'Demo Customer', role: 'customer' },
  { email: 'admin@demo.local', password: 'admin123', name: 'Demo Admin', role: 'admin' },
];

const KEY = 'fat_session';
const CUSTOMERS_KEY = 'fat_customers';

interface StoredCustomer {
  email: string;
  name: string;
  password: string;
}

function readCustomers(): StoredCustomer[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function register(name: string, email: string, password: string): User {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanName) throw new Error('Please enter your name.');
  if (!/.+@.+\..+/.test(cleanEmail)) throw new Error('Please enter a valid email address.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  const taken =
    USERS.some((u) => u.email.toLowerCase() === cleanEmail) ||
    readCustomers().some((u) => u.email.toLowerCase() === cleanEmail);
  if (taken) throw new Error('An account with this email already exists. Log in instead.');
  const user: User = { email: cleanEmail, name: cleanName, role: 'customer' };
  const customers = readCustomers();
  customers.push({ email: cleanEmail, name: cleanName, password });
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

export function login(email: string, password: string): User {
  const cleanEmail = email.trim().toLowerCase();
  const staff = USERS.find((u) => u.email.toLowerCase() === cleanEmail && u.password === password);
  if (staff) {
    const { password: _pw, ...user } = staff;
    localStorage.setItem(KEY, JSON.stringify(user));
    return user;
  }
  const customer = readCustomers().find((u) => u.email.toLowerCase() === cleanEmail && u.password === password);
  if (customer) {
    const user: User = { email: customer.email, name: customer.name, role: 'customer' };
    localStorage.setItem(KEY, JSON.stringify(user));
    return user;
  }
  throw new Error('Unknown email or wrong password. Sign up first, or use a demo account below.');
}

export function logout(): void {
  localStorage.removeItem(KEY);
}

export function getSession(): User | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as User;
    if (user.role !== 'customer' && user.role !== 'admin') return null;
    return user;
  } catch {
    return null;
  }
}
