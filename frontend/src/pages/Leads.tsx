import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, MapPin, Calendar, FileText, Sparkles } from 'lucide-react';
import api from '../lib/axios';
import type { Lead, Customer } from '../types';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'tag-blue' },
  { value: 'contacted', label: 'Contacted', color: 'tag-yellow' },
  { value: 'quotation', label: 'Quotation', color: 'tag' },
  { value: 'accepted', label: 'Accepted', color: 'tag-green' },
  { value: 'converted', label: 'Converted', color: 'tag' },
  { value: 'lost', label: 'Lost', color: 'tag-red' },
];

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [aiConversation, setAiConversation] = useState('');
  const [aiExtracting, setAiExtracting] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    customer: '',
    service: '',
    location: '',
    requirement: '',
    preferred_date: '',
  });

  useEffect(() => {
    fetchLeads();
    fetchCustomers();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads/');
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers/');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleAIAction = async () => {
    if (!aiConversation.trim()) return;

    setAiExtracting(true);
    try {
      const response = await api.post('/leads/extract_from_conversation/', {
        conversation: aiConversation,
      });
      setAiResult(response.data);
    } catch (error) {
      console.error('AI extraction failed:', error);
      alert('Failed to extract information. Please try again or enter manually.');
    } finally {
      setAiExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead.id}/`, formData);
      } else {
        await api.post('/leads/', formData);
      }
      fetchLeads();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const handleStatusUpdate = async (lead: Lead, newStatus: string) => {
    try {
      await api.put(`/leads/${lead.id}/`, { ...lead, status: newStatus });
      fetchLeads();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${id}/`);
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      customer: lead.customer.toString(),
      service: lead.service,
      location: lead.location || '',
      requirement: lead.requirement,
      preferred_date: lead.preferred_date || '',
    });
    setShowModal(true);
  };

  const useAIResult = () => {
    if (!aiResult) return;

    // Check if customer exists
    const existingCustomer = customers.find(c =>
      c.name.toLowerCase() === aiResult.customer_name?.toLowerCase()
    );

    if (existingCustomer) {
      setFormData({
        customer: existingCustomer.id.toString(),
        service: aiResult.service || '',
        location: aiResult.location || '',
        requirement: aiConversation, // Use original conversation as requirement
        preferred_date: aiResult.preferred_date || '',
      });
    } else {
      // Will need to create customer first (future feature)
      alert(`New customer "${aiResult.customer_name}" detected. Please create the customer first, then create the lead.`);
    }

    setShowAIModal(false);
    setAiConversation('');
    setAiResult(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ customer: '', service: '', location: '', requirement: '', preferred_date: '' });
    setEditingLead(null);
  };

  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find(o => o.value === status);
    return option ? option.color : 'tag';
  };

  const filteredLeads = leads.filter(lead =>
    lead.service.toLowerCase().includes(search.toLowerCase()) ||
    lead.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    (lead.location && lead.location.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-text-primary">
            Leads
          </h1>
          <p className="mt-2 text-text-secondary">
            Manage your sales pipeline and convert opportunities into jobs.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => { setShowAIModal(true); setAiResult(null); }}
            className="btn-secondary flex items-center"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            AI Extract
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by service, customer, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Lead Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATUS_OPTIONS.map(status => {
          const count = leads.filter(l => l.status === status.value).length;
          return (
            <div key={status.value} className="card text-center p-4">
              <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${status.color} mb-2`}>
                {status.label}
              </div>
              <div className="text-2xl font-semibold text-text-primary">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Lead List */}
      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-text-secondary">No leads found.</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead.id} className="card hover:shadow-subtle transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-text-primary">{lead.service}</h3>
                    <span className={`tag ${getStatusColor(lead.status)}`}>
                      {STATUS_OPTIONS.find(o => o.value === lead.status)?.label}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-text-secondary">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {lead.customer_name}
                    </div>
                    {lead.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {lead.location}
                      </div>
                    )}
                    {lead.preferred_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Preferred: {lead.preferred_date}
                      </div>
                    )}
                    <div className="flex items-start">
                      <FileText className="h-4 w-4 mr-2 mt-0.5" />
                      <span className="line-clamp-2">{lead.requirement}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 ml-4">
                  {/* Status Dropdown */}
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusUpdate(lead, e.target.value)}
                    className="text-sm border border-border rounded-sm px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => handleEdit(lead)}
                      className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-sm transition-all"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
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

      {/* AI Extraction Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card w-full max-w-2xl shadow-lg fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center">
                <Sparkles className="h-6 w-6 text-text-primary mr-3" />
                <h2 className="text-lg font-semibold text-text-primary">
                  AI Lead Extraction
                </h2>
              </div>
              <button
                onClick={() => { setShowAIModal(false); setAiConversation(''); setAiResult(null); }}
                className="text-text-secondary hover:text-text-primary text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Paste Customer Conversation
                </label>
                <textarea
                  value={aiConversation}
                  onChange={(e) => setAiConversation(e.target.value)}
                  placeholder="Example: Rahul: Bro my AC is not cooling. Can you come tomorrow? Location is Kannur."
                  className="input-field h-32 resize-none"
                />
              </div>

              {!aiResult ? (
                <button
                  onClick={handleAIAction}
                  disabled={!aiConversation.trim() || aiExtracting}
                  className="w-full btn-primary py-3 flex items-center justify-center"
                >
                  {aiExtracting ? (
                    <>
                      <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Extract Information
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-surface border border-border rounded-sm p-4 space-y-3">
                    <h4 className="font-medium text-text-primary">Extracted Information:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-text-secondary">Customer Name:</span>
                        <span className="ml-2 font-medium text-text-primary">{aiResult.customer_name}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Phone:</span>
                        <span className="ml-2 font-medium text-text-primary">{aiResult.phone || 'Not found'}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Service:</span>
                        <span className="ml-2 font-medium text-text-primary">{aiResult.service}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Location:</span>
                        <span className="ml-2 font-medium text-text-primary">{aiResult.location}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Preferred Date:</span>
                        <span className="ml-2 font-medium text-text-primary">{aiResult.preferred_date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => { setAiResult(null); setAiConversation(''); setShowAIModal(false); }}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={useAIResult}
                      className="flex-1 btn-primary"
                    >
                      Use This Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card w-full max-w-lg shadow-lg fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
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
                  Customer *
                </label>
                <select
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Service Type *
                </label>
                <input
                  type="text"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  placeholder="e.g., AC Repair, Plumbing, Electrical"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Kannur, Kozhikode"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Requirement *
                </label>
                <textarea
                  value={formData.requirement}
                  onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                  placeholder="Describe what the customer needs..."
                  className="input-field h-24 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Preferred Date
                </label>
                <input
                  type="text"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  placeholder="e.g., Tomorrow, Next Week, 25th Sept"
                  className="input-field"
                />
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
                  {editingLead ? 'Save Changes' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}