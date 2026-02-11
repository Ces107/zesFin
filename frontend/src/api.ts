import axios from 'axios';
import type { Transaction, PortfolioSnapshot, Asset, DashboardSummary, FireProfile, FireProjection } from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Dashboard
export const fetchDashboardSummary = () =>
  api.get<DashboardSummary>('/dashboard/summary').then(r => r.data);

// Transactions
export const fetchTransactions = () =>
  api.get<Transaction[]>('/transactions').then(r => r.data);

export const createTransaction = (tx: Transaction) =>
  api.post<Transaction>('/transactions', tx).then(r => r.data);

export const deleteTransaction = (id: number) =>
  api.delete(`/transactions/${id}`);

// Portfolio Snapshots
export const fetchSnapshots = () =>
  api.get<PortfolioSnapshot[]>('/portfolio/snapshots').then(r => r.data);

export const fetchLatestSnapshot = () =>
  api.get<PortfolioSnapshot>('/portfolio/snapshots/latest').then(r => r.data);

export const createSnapshot = (snapshot: PortfolioSnapshot) =>
  api.post<PortfolioSnapshot>('/portfolio/snapshots', snapshot).then(r => r.data);

export const updateSnapshot = (id: number, snapshot: PortfolioSnapshot) =>
  api.put<PortfolioSnapshot>(`/portfolio/snapshots/${id}`, snapshot).then(r => r.data);

export const deleteSnapshot = (id: number) =>
  api.delete(`/portfolio/snapshots/${id}`);

// Assets
export const fetchAssets = () =>
  api.get<Asset[]>('/assets').then(r => r.data);

export const createAsset = (asset: Asset) =>
  api.post<Asset>('/assets', asset).then(r => r.data);

export const updateAsset = (id: number, asset: Asset) =>
  api.put<Asset>(`/assets/${id}`, asset).then(r => r.data);

export const deleteAsset = (id: number) =>
  api.delete(`/assets/${id}`);

// FIRE
export const fetchFireProfiles = () =>
  api.get<FireProfile[]>('/fire/profiles').then(r => r.data);

export const createFireProfile = (profile: FireProfile) =>
  api.post<FireProfile>('/fire/profiles', profile).then(r => r.data);

export const updateFireProfile = (id: number, profile: FireProfile) =>
  api.put<FireProfile>(`/fire/profiles/${id}`, profile).then(r => r.data);

export const fetchFireProjection = (profileId: number) =>
  api.get<FireProjection>(`/fire/projection/${profileId}`).then(r => r.data);

export const simulateFireProjection = (profile: FireProfile) =>
  api.post<FireProjection>('/fire/projection/simulate', profile).then(r => r.data);
