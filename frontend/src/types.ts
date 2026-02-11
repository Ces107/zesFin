export interface Transaction {
  id?: number;
  amount: number;
  date: string;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
}

export interface PortfolioSnapshot {
  id?: number;
  date: string;
  totalInvested: number;
  portfolioValue: number;
  monthlyContribution: number;
  fixedIncomePercentage: number;
  yield: number;
}

export interface Asset {
  id?: number;
  name: string;
  isin: string | null;
  category: 'EQUITY' | 'BONDS' | 'CRYPTO' | 'CASH' | 'REAL_ESTATE';
  currentValue: number;
  currency: string;
  allocationPercentage: number;
  totalInvested: number;
  unrealizedGain: number;
}

export interface DashboardSummary {
  totalPatrimonio: number;
  totalInvested: number;
  yield: number;
  netCashFlow: number;
  totalAssetValue: number;
}

export interface FireProfile {
  id?: number;
  currentAge: number;
  currentSavings: number;
  monthlyContribution: number;
  monthlyExpenses: number;
  expectedReturnRate: number;
  inflationRate: number;
  safeWithdrawalRate: number;
  targetRetirementAge: number;
  fireNumber: number;
  annualContributionIncreaseRate: number | null;
}

export interface YearlyProjection {
  age: number;
  year: number;
  totalSavings: number;
  totalContributions: number;
  totalGrowth: number;
  fireNumber: number;
  annualContribution: number;
  fireMilestone: boolean;
}

export interface FireProjection {
  currentAge: number;
  fireAge: number | null;
  yearsToFire: number | null;
  fireNumber: number;
  currentSavings: number;
  projectedSavingsAtFire: number;
  yearlyProjections: YearlyProjection[];
  fireAchievable: boolean;
}
