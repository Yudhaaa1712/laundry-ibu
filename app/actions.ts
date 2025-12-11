'use server';

import { revalidatePath } from 'next/cache';
import { getServiceSupabase } from '../lib/supabase';
import { SERVICE_RATES } from '../lib/constants';

function startOfTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfWeekISO() {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? 6 : day - 1); // Start from Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function toNumber(v: FormDataEntryValue | null): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function addTransaction(formData: FormData) {
  const supabase = getServiceSupabase();
  const customer_name = String(formData.get('customer_name') || '').trim();
  const service_type = String(formData.get('service_type') || '').trim();
  const weight_kg = toNumber(formData.get('weight_kg'));
  const status = String(formData.get('status') || 'Belum Lunas');
  const rate = SERVICE_RATES[service_type] ?? 6000;
  const total_price = Math.round(weight_kg * rate);

  if (!customer_name || !service_type || weight_kg <= 0) {
    throw new Error('Data pesanan tidak lengkap.');
  }

  const { error } = await supabase
    .from('transactions')
    .insert([{ customer_name, service_type, weight_kg, total_price, status }]);

  if (error) throw error;
  revalidatePath('/');
  return { ok: true, total_price };
}

export async function addExpense(formData: FormData) {
  const supabase = getServiceSupabase();
  const category = String(formData.get('category') || '').trim();
  const amount = toNumber(formData.get('amount'));
  const description = String(formData.get('description') || '').trim();

  if (!category || amount <= 0) {
    throw new Error('Data pengeluaran tidak lengkap.');
  }

  const { error } = await supabase
    .from('expenses')
    .insert([{ category, amount, description }]);

  if (error) throw error;
  revalidatePath('/');
  return { ok: true };
}

export async function payWage(formData: FormData) {
  const supabase = getServiceSupabase();
  const employee_id = String(formData.get('employee_id') || '').trim();
  const weight_processed = toNumber(formData.get('weight_processed'));

  if (!employee_id || weight_processed <= 0) {
    throw new Error('Data gaji tidak lengkap.');
  }

  const { data: emp, error: empErr } = await supabase
    .from('employees')
    .select('id, name, wage_per_kg')
    .eq('id', employee_id)
    .single();

  if (empErr || !emp) throw empErr ?? new Error('Pegawai tidak ditemukan.');

  const total_wage = Math.round(weight_processed * Number(emp.wage_per_kg));

  const { error: wErr } = await supabase
    .from('wage_records')
    .insert([{ employee_id, weight_processed, total_wage }]);
  if (wErr) throw wErr;

  const { error: eErr } = await supabase
    .from('expenses')
    .insert([{ category: 'Gaji Karyawan', amount: total_wage, description: `Pembayaran gaji ${emp.name}` }]);
  if (eErr) throw eErr;

  revalidatePath('/');
  return { ok: true, total_wage };
}

// Get Weekly Stats (reset setiap minggu)
export async function getWeeklyStats() {
  const supabase = getServiceSupabase();
  const fromISO = startOfWeekISO();

  const [txAgg, exAgg] = await Promise.all([
    supabase
      .from('transactions')
      .select('total_price', { count: 'exact', head: false })
      .gte('created_at', fromISO)
      .eq('status', 'Lunas'),
    supabase
      .from('expenses')
      .select('amount', { count: 'exact', head: false })
      .gte('created_at', fromISO),
  ]);

  const incomeWeek = (txAgg.data || []).reduce((s, r: any) => s + Number(r.total_price || 0), 0);
  const expenseWeek = (exAgg.data || []).reduce((s, r: any) => s + Number(r.amount || 0), 0);

  return { incomeWeek, expenseWeek, cashWeek: incomeWeek - expenseWeek };
}

export async function getDashboardStats() {
  const supabase = getServiceSupabase();
  const fromISO = startOfTodayISO();

  const [txAgg, exAgg] = await Promise.all([
    supabase
      .from('transactions')
      .select('total_price', { count: 'exact', head: false })
      .gte('created_at', fromISO)
      .eq('status', 'Lunas'),
    supabase
      .from('expenses')
      .select('amount', { count: 'exact', head: false })
      .gte('created_at', fromISO),
  ]);

  const incomeToday = (txAgg.data || []).reduce((s, r: any) => s + Number(r.total_price || 0), 0);
  const expenseToday = (exAgg.data || []).reduce((s, r: any) => s + Number(r.amount || 0), 0);

  return { incomeToday, expenseToday, cashToday: incomeToday - expenseToday };
}

export async function listEmployees() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('employees')
    .select('id, name, wage_per_kg')
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function listUnpaidTransactions() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('transactions')
    .select('id, created_at, customer_name, service_type, weight_kg, total_price, status')
    .eq('status', 'Belum Lunas')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function updateTransactionStatus(id: string, status: 'Lunas' | 'Belum Lunas') {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from('transactions')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
  revalidatePath('/');
  return { ok: true };
}

// List all transactions with optional date filter
export async function listTransactions({ fromISO, toISO, status }: { fromISO?: string; toISO?: string; status?: string } = {}) {
  const supabase = getServiceSupabase();
  let q = supabase
    .from('transactions')
    .select('id, created_at, customer_name, service_type, weight_kg, total_price, status')
    .order('created_at', { ascending: false })
    .limit(100);

  if (fromISO) q = q.gte('created_at', fromISO);
  if (toISO) q = q.lte('created_at', toISO);
  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function listExpenses({ fromISO, toISO }: { fromISO?: string; toISO?: string } = {}) {
  const supabase = getServiceSupabase();
  let q = supabase
    .from('expenses')
    .select('id, created_at, category, amount, description')
    .order('created_at', { ascending: false })
    .limit(100);
  if (fromISO) q = q.gte('created_at', fromISO);
  if (toISO) q = q.lte('created_at', toISO);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function listWageRecords({ fromISO, toISO }: { fromISO?: string; toISO?: string } = {}) {
  const supabase = getServiceSupabase();
  let q = supabase
    .from('wage_records')
    .select('id, created_at, employee_id, weight_processed, total_wage, employees(name)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (fromISO) q = q.gte('created_at', fromISO);
  if (toISO) q = q.lte('created_at', toISO);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

// Enhanced getPeriodReport with more period options
export type ReportPeriod = 'day' | 'week' | '15days' | 'month' | 'year' | 'custom';

export async function getPeriodReport(
  period: ReportPeriod,
  customFrom?: string,
  customTo?: string
) {
  const supabase = getServiceSupabase();
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (period === 'custom' && customFrom && customTo) {
    start = new Date(customFrom);
    end = new Date(customTo);
    end.setHours(23, 59, 59, 999);
  } else if (period === 'day') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    const day = start.getDay();
    const diff = (day === 0 ? 6 : day - 1); // start Monday
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
  } else if (period === '15days') {
    start.setDate(start.getDate() - 14);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'year') {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }

  const fromISO = start.toISOString();
  const toISO = end.toISOString();

  const [tx, ex, wg, allTx] = await Promise.all([
    supabase.from('transactions').select('total_price, status, created_at').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('expenses').select('amount, created_at').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('wage_records').select('total_wage, created_at').gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('transactions').select('total_price, status, created_at').gte('created_at', fromISO).lte('created_at', toISO),
  ]);

  const income = (tx.data || []).filter((t: any) => t.status === 'Lunas').reduce((s: any, t: any) => s + Number(t.total_price || 0), 0);
  const pendingIncome = (tx.data || []).filter((t: any) => t.status === 'Belum Lunas').reduce((s: any, t: any) => s + Number(t.total_price || 0), 0);
  const expense = (ex.data || []).reduce((s: any, e: any) => s + Number(e.amount || 0), 0);
  const wages = (wg.data || []).reduce((s: any, w: any) => s + Number(w.total_wage || 0), 0);
  const totalOrders = (allTx.data || []).length;
  const totalWeight = 0; // Would need weight data to calculate this

  return {
    income,
    pendingIncome,
    expense,
    wages,
    cash: income - expense,
    totalOrders,
    fromDate: fromISO,
    toDate: toISO
  };
}

// Delete transaction
export async function deleteTransaction(id: string) {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  if (error) throw error;
  revalidatePath('/');
  return { ok: true };
}

// Delete expense
export async function deleteExpense(id: number) {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  if (error) throw error;
  revalidatePath('/');
  return { ok: true };
}
