export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: number;
  customer: number;
  customer_name: string;
  service: string;
  location: string | null;
  requirement: string;
  status: 'new' | 'contacted' | 'quotation' | 'accepted' | 'converted' | 'lost';
  preferred_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Quotation {
  id: number;
  lead: number;
  customer_name: string;
  total_amount: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  items: QuotationItem[];
  created_at: string;
}

export interface Job {
  id: number;
  lead: number;
  quotation: number | null;
  customer_name: string;
  service: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string | null;
  completed_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Payment {
  id: number;
  job: number;
  customer_name: string;
  amount: string;
  method: 'cash' | 'upi' | 'bank' | 'other';
  status: string;
  payment_date: string;
}
