import { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, CreditCard, Banknote, Wallet, TrendingUp, Download } from 'lucide-react';
import api from '../lib/axios';
import type { Payment, Job } from '../types';

const METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash', icon: DollarSign, color: 'tag-green' },
  { value: 'upi', label: 'UPI', icon: CreditCard, color: 'tag-blue' },
  { value: 'bank', label: 'Bank Transfer', icon: Banknote, color: 'tag' },
  { value: 'other', label: 'Other', icon: Wallet, color: 'tag-yellow' },
];

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    job: '',
    amount: '',
    method: 'cash',
  });

  useEffect(() => {
    fetchPayments();
    fetchJobs();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments/');
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job || !formData.amount) {
      alert('Please select a job and enter amount');
      return;
    }

    try {
      await api.post('/payments/', {
        job: formData.job,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: 'completed',
      });
      fetchPayments();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const resetForm = () => {
    setFormData({ job: '', amount: '', method: 'cash' });
  };

  const getMethodInfo = (method: string) => {
    return METHOD_OPTIONS.find(m => m.value === method) || METHOD_OPTIONS[0];
  };

  // Calculate stats
  const stats = {
    totalRevenue: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
    cashPayments: payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + parseFloat(p.amount), 0),
    upiPayments: payments.filter(p => p.method === 'upi').reduce((sum, p) => sum + parseFloat(p.amount), 0),
    bankPayments: payments.filter(p => p.method === 'bank').reduce((sum, p) => sum + parseFloat(p.amount), 0),
    totalPayments: payments.length,
  };

  const filteredPayments = payments.filter(payment =>
    payment.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    payment.amount.toString().includes(search) ||
    payment.method.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-text-primary">
            Payments
          </h1>
          <p className="mt-2 text-text-secondary">
            Record and track payments for completed jobs.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center justify-center sm:justify-start"
        >
          <Plus className="h-5 w-5 mr-2" />
          Record Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Revenue</p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">
                ₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-surface border border-border">
              <TrendingUp className="h-6 w-6 text-text-secondary" />
            </div>
          </div>
        </div>

        {METHOD_OPTIONS.map(method => {
          const total = payments.filter(p => p.method === method.value).reduce((sum, p) => sum + parseFloat(p.amount), 0);
          const count = payments.filter(p => p.method === method.value).length;
          return (
            <div key={method.value} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">{method.label}</p>
                  <p className="mt-1 text-xl font-semibold text-text-primary">
                    ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-text-secondary">{count} payments</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-surface border border-border">
                  <method.icon className="h-6 w-6 text-text-secondary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by customer, amount, or payment method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="card text-center py-12">
            <DollarSign className="h-12 w-12 text-text-secondary mx-auto mb-3 opacity-50" />
            <p className="text-text-secondary">No payments found.</p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const methodInfo = getMethodInfo(payment.method);
            return (
              <div key={payment.id} className="card hover:shadow-subtle transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-text-primary">
                        Payment #{payment.id}
                      </h3>
                      <span className={`tag ${methodInfo.color} flex items-center`}>
                        <methodInfo.icon className="h-3 w-3 mr-1" />
                        {methodInfo.label}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-text-secondary">
                      <div className="font-medium text-text-primary">{payment.customer_name}</div>
                      <div>Job #{payment.job}</div>
                      <div>Amount: <span className="font-semibold text-text-primary">₹{parseFloat(payment.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></div>
                      <div>Date: {new Date(payment.payment_date).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => alert('Download receipt coming soon')}
                      className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-sm transition-all"
                      title="Download Receipt"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card w-full max-w-md shadow-lg fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">
                Record New Payment
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-secondary hover:text-text-primary text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Select Job *
                </label>
                <select
                  value={formData.job}
                  onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Choose a job...</option>
                  {jobs.filter(j => j.status === 'completed').map(job => (
                    <option key={job.id} value={job.id}>
                      Job #{job.id} - {job.customer_name} ({job.service})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-text-secondary mt-1">
                  Only completed jobs are shown
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {METHOD_OPTIONS.map(method => (
                    <button
                      type="button"
                      key={method.value}
                      onClick={() => setFormData({ ...formData, method: method.value })}
                      className={`flex items-center justify-center p-3 border rounded-sm transition-all ${
                        formData.method === method.value
                          ? 'border-accent-blue bg-accent-blue-bg'
                          : 'border-border hover:bg-surface'
                      }`}
                    >
                      <method.icon className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-accent-green-bg border border-accent-green rounded-sm p-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-text-primary">Payment Total:</span>
                  <span className="text-2xl font-bold text-accent-green">
                    ₹{formData.amount ? parseFloat(formData.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0.00'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}