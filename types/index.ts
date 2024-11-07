export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  subscription_status: 'free' | 'basic' | 'pro';
  subscription_end_date?: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface UsageStats {
  total_messages: number;
  total_conversations: number;
  messages_this_month: number;
  remaining_messages: number;
}

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due';
  plan: 'free' | 'basic' | 'pro';
  current_period_end: string;
  cancel_at_period_end: boolean;
}