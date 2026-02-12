import axios from 'axios';
import { toast } from 'sonner';
import type { Transaction, PortfolioSnapshot, Asset, DashboardSummary, FireProfile, FireProjection, AuthUser } from './types';

const TOKEN_KEY = 'zesfin_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/zesFin/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const fetchCurrentUser = () =>
  api.get<AuthUser>('/auth/me').then(r => r.data);

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

export const createSnapshot = async (snapshot: PortfolioSnapshot) => {
  try {
    const response = await api.post<PortfolioSnapshot>('/portfolio/snapshots', snapshot);
    toast.success('Entry created successfully');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      const detail = error.response.data.detail || 'Duplicate entry detected';
      toast.error(detail, {
        description: 'Please choose a different date or entry type',
        duration: 5000
      });
    } else {
      toast.error('Failed to create entry');
    }
    throw error;
  }
};

export const updateSnapshot = async (id: number, snapshot: PortfolioSnapshot) => {
  try {
    const response = await api.put<PortfolioSnapshot>(`/portfolio/snapshots/${id}`, snapshot);
    toast.success('Entry updated successfully');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      toast.error(error.response.data.detail || 'Duplicate entry detected', {
        duration: 5000
      });
    } else {
      toast.error('Failed to update entry');
    }
    throw error;
  }
};

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
