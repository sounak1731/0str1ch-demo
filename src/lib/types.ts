
import type { Layouts } from "react-grid-layout";

export interface Sale {
  id: string;
  product: string;
  region: string;
  revenue: number;
  month: string;
  marketingSpend: number;
  cac: number; // Customer Acquisition Cost
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface Forecast extends Sale {}

export interface ABTestResult {
  variant: 'A' | 'B';
  users: number;
  conversions: number;
  marketingSpend: number;
}

export interface WhatIfScenario {
  name: string;
  pessimistic: number;
  neutral: number;
  optimistic: number;
}

export interface Comment {
    id: string;
    user: string;
    avatarFallback: string;
    text: string;
    resolved?: boolean;
}

export interface Activity {
  id: string;
  type: 'comment' | 'action';
  user: string;
  avatarFallback: string;
  timestamp: string;
  text: string;
  artifactName?: string;
  resolved?: boolean;
}

export interface Sheet {
  id: string;
  name: string;
  layouts: Layouts;
}
