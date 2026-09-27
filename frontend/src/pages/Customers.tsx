import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import api from '../lib/axios';
import type { Customer } from '../types';
import PressButton from '../components/ui/PressButton';
import Modal from '../components/ui/Modal';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers/');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}/`, formData);
      } else {
        await api.post('/customers/', formData);
      }
      fetchCustomers();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}/`);
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    setEditingCustomer(null);
  };

  const handleClose = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-text-secondary">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your customer relationships.</p>
        </div>
        <PressButton
          className="btn-primary"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add Customer
        </PressButton>
      </div>

      {/* Search */}
      <div className="card-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
            aria-label="Search customers"
          />
        </div>
      </div>

      {/* Customer list */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-sm text-text-secondary">
              {search ? 'No customers match your search.' : 'No customers yet. Add your first one.'}
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="card hover:shadow-raised transition-shadow duration-150"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary">{customer.name}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
                        {customer.email}
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
                        {customer.address}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
                      Added {new Date(customer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {customer.notes && (
                    <p className="mt-3 text-xs text-text-secondary bg-canvas px-3 py-2 rounded-sm border border-border">
                      {customer.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <PressButton
                    onClick={() => handleEdit(customer)}
                    aria-label={`Edit ${customer.name}`}
                    className="h-8 w-8 flex items-center justify-center rounded-sm text-text-muted hover:text-text-primary hover:bg-canvas transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </PressButton>
                  <PressButton
                    onClick={() => handleDelete(customer.id)}
                    aria-label={`Delete ${customer.name}`}
                    className="h-8 w-8 flex items-center justify-center rounded-sm text-text-muted hover:text-status-red hover:bg-status-red-bg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </PressButton>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={handleClose}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cust-name" className="block text-xs font-medium text-text-primary mb-1">
              Name <span className="text-status-red">*</span>
            </label>
            <input
              id="cust-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="cust-phone" className="block text-xs font-medium text-text-primary mb-1">
              Phone <span className="text-status-red">*</span>
            </label>
            <input
              id="cust-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
              required
              autoComplete="tel"
            />
          </div>
          <div>
            <label htmlFor="cust-email" className="block text-xs font-medium text-text-primary mb-1">
              Email
            </label>
            <input
              id="cust-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="cust-address" className="block text-xs font-medium text-text-primary mb-1">
              Address
            </label>
            <textarea
              id="cust-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field resize-none"
              rows={2}
            />
          </div>
          <div>
            <label htmlFor="cust-notes" className="block text-xs font-medium text-text-primary mb-1">
              Notes
            </label>
            <textarea
              id="cust-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field resize-none"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <PressButton type="button" onClick={handleClose} className="btn-secondary">
              Cancel
            </PressButton>
            <PressButton type="submit" className="btn-primary">
              {editingCustomer ? 'Save Changes' : 'Add Customer'}
            </PressButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
