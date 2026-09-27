import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Download, FileText } from 'lucide-react';
import api from '../lib/axios';
import type { Quotation, Lead } from '../types';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'tag-yellow' },
  { value: 'sent', label: 'Sent', color: 'tag-blue' },
  { value: 'accepted', label: 'Accepted', color: 'tag-green' },
  { value: 'rejected', label: 'Rejected', color: 'tag-red' },
];

export default function Quotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [formData, setFormData] = useState({
    lead: '',
    items: [{ description: '', quantity: 1, unit_price: 0 }],
  });

  useEffect(() => {
    fetchQuotations();
    fetchLeads();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await api.get('/quotations/');
      setQuotations(response.data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads/');
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unit_price: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lead || formData.items.length === 0) {
      alert('Please select a lead and add at least one item');
      return;
    }

    try {
      const total = calculateTotal();
      if (editingQuotation) {
        await api.put(`/quotations/${editingQuotation.id}/`, {
          lead: formData.lead,
          total_amount: total,
        });
      } else {
        await api.post('/quotations/', {
          lead: formData.lead,
          total_amount: total,
        });
      }
      fetchQuotations();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving quotation:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this quotation?')) {
      try {
        await api.delete(`/quotations/${id}/`);
        fetchQuotations();
      } catch (error) {
        console.error('Error deleting quotation:', error);
      }
    }
  };

  const handleStatusUpdate = async (quotation: Quotation, newStatus: string) => {
    try {
      await api.put(`/quotations/${quotation.id}/`, { ...quotation, status: newStatus });
      fetchQuotations();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleGeneratePDF = (_quotation: Quotation) => {
    // Placeholder for PDF generation
    alert('PDF export coming soon. For now, use print-to-PDF in your browser.');
  };

  const resetForm = () => {
    setFormData({ lead: '', items: [{ description: '', quantity: 1, unit_price: 0 }] });
    setEditingQuotation(null);
  };

  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find(o => o.value === status);
    return option ? option.color : 'tag';
  };

  const filteredQuotations = quotations.filter(q =>
    q.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    q.total_amount.toString().includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading quotations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-text-primary">
            Quotations
          </h1>
          <p className="mt-2 text-text-secondary">
            Create and manage quotes for your leads.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Quotation
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by customer or amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Quotations List */}
      <div className="space-y-4">
        {filteredQuotations.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-12 w-12 text-text-secondary mx-auto mb-3 opacity-50" />
            <p className="text-text-secondary">No quotations found.</p>
          </div>
        ) : (
          filteredQuotations.map((quotation) => (
            <div key={quotation.id} className="card hover:shadow-subtle transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Quote #{quotation.id}
                    </h3>
                    <span className={`tag ${getStatusColor(quotation.status)}`}>
                      {STATUS_OPTIONS.find(o => o.value === quotation.status)?.label}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-text-secondary">
                    <div className="font-medium text-text-primary">{quotation.customer_name}</div>
                    <div className="flex items-center justify-between">
                      <span>Total Amount:</span>
                      <span className="text-lg font-semibold text-text-primary">
                        ₹{parseFloat(quotation.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>Created on {new Date(quotation.created_at).toLocaleDateString()}</div>
                  </div>

                  {quotation.items && quotation.items.length > 0 && (
                    <div className="mt-4 bg-surface border border-border rounded-sm p-3 space-y-2">
                      {quotation.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-text-secondary">
                          <span>{item.description}</span>
                          <span>
                            {item.quantity} × ₹{item.unit_price.toLocaleString('en-IN')} = ₹{(item.quantity * item.unit_price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2 ml-4">
                  <select
                    value={quotation.status}
                    onChange={(e) => handleStatusUpdate(quotation, e.target.value)}
                    className="text-sm border border-border rounded-sm px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleGeneratePDF(quotation)}
                      title="Export as PDF"
                      className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-sm transition-all"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(quotation.id)}
                      title="Delete"
                      className="p-2 text-text-secondary hover:text-accent-red hover:bg-accent-red-bg rounded-sm transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Quotation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-card w-full max-w-2xl shadow-lg fade-in-up my-8">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-text-primary">
                {editingQuotation ? 'Edit Quotation' : 'New Quotation'}
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
                  Select Lead *
                </label>
                <select
                  value={formData.lead}
                  onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Choose a lead...</option>
                  {leads.filter(l => l.status !== 'converted' && l.status !== 'lost').map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.customer_name} - {lead.service}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-text-primary">
                    Line Items *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs btn-secondary px-2 py-1"
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3 bg-surface border border-border rounded-sm p-4">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="input-field flex-1 text-sm"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="input-field w-16 text-sm"
                        step="0.01"
                        min="0"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="input-field w-24 text-sm"
                        step="0.01"
                        min="0"
                        required
                      />
                      <div className="w-20 text-right text-sm font-medium text-text-primary pt-2">
                        ₹{(item.quantity * item.unit_price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-2 text-text-secondary hover:text-accent-red hover:bg-accent-red-bg rounded-sm"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-accent-green-bg border border-accent-green rounded-sm p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-text-primary">Total Amount:</span>
                  <span className="text-2xl font-bold text-accent-green">
                    ₹{calculateTotal().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
                  {editingQuotation ? 'Save Changes' : 'Create Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}