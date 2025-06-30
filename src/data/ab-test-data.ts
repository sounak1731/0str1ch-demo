import type { ABTestResult } from '@/lib/types';

export const abTestData: ABTestResult[] = [
  { variant: 'A', users: 1024, conversions: 82, marketingSpend: 500 },
  { variant: 'B', users: 1012, conversions: 121, marketingSpend: 550 },
];
