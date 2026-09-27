import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, CheckCircle, Clock, XCircle, Briefcase } from 'lucide-react';
import api from '../lib/axios';
import type { Job, Quotation } from '../types';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled', color: 'tag-blue' },
  { value: 'in_progress', label: 'In Progress', color: 'tag-yellow' },
  { value: 'completed', label: 'Completed', color: 'tag-green' },
  { value: 'cancelled', label: 'Cancelled', color: 'tag-red' },
];

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    lead: '',
    quotation: '',
    status: 'scheduled',
    scheduled_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchJobs();
    fetchQuotations();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotations = async () => {
    try {
      const response = await api.get('/quotations/');
      setQuotations(response.data);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await api.put(`/jobs/${editingJob.id}/`, formData);
      } else {
        await api.post('/jobs/', formData);
      }
      fetchJobs();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleStatusUpdate = async (job: Job, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'completed') {
        updateData.completed_date = new Date().toISOString();
      }
      await api.put(`/jobs/${job.id}/`, updateData);
      fetchJobs();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this job?')) {
      try {
        await api.delete(`/jobs/${id}/`);
        fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      lead: job.lead.toString(),
      quotation: job.quotation?.toString() || '',
      status: job.status,
      scheduled_date: job.scheduled_date ? job.scheduled_date.split('T')[0] : '',
      notes: job.notes || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ lead: '', quotation: '', status: 'scheduled', scheduled_date: '', notes: '' });
    setEditingJob(null);
  };

  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find(o => o.value === status);
    return option ? option.color : 'tag';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    job.service.toLowerCase().includes(search.toLowerCase()) ||
    job.status.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const stats = {
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
    inProgress: jobs.filter(j => j.status === 'in_progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    cancelled: jobs.filter(j => j.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-text-primary">
            Jobs
          </h1>
          <p className="mt-2 text-text-secondary">
            Track and manage your service jobs.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUS_OPTIONS.map(status => (
          <div key={status.value} className="card text-center p-4">
            <div className={`inline-flex p-2 rounded-sm ${status.color} mb-2`}>
              {getStatusIcon(status.value)}
            </div>
            <div className="text-2xl font-semibold text-text-primary">
              {stats[status.value as keyof typeof stats] || 0}
            </div>
            <div className="text-sm text-text-secondary">{status.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by customer, service, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="card text-center py-12">
            <Briefcase className="h-12 w-12 text-text-secondary mx-auto mb-3 opacity-50" />
            <p className="text-text-secondary">No jobs found.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="card hover:shadow-subtle transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Job #{job.id}
                    </h3>
                    <span className={`tag ${getStatusColor(job.status)}`}>
                      {STATUS_OPTIONS.find(o => o.value === job.status)?.label}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-text-secondary">
                    <div className="font-medium text-text-primary">{job.customer_name}</div>
                    <div>Service: {job.service}</div>
                    {job.scheduled_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Scheduled: {new Date(job.scheduled_date).toLocaleString()}
                      </div>
                    )}
                    {job.completed_date && (
                      <div className="flex items-center text-accent-green">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed: {new Date(job.completed_date).toLocaleString()}
                      </div>
                    )}
                    {job.notes && (
                      <div className="bg-surface border border-border rounded-sm p-2 mt-2 text-text-primary">
                        {job.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 ml-4">
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusUpdate(job, e.target.value)}
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
                      onClick={() => handleEdit(job)}
                      className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-sm transition-all"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
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

      {/* Add/Edit Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card w-full max-w-lg shadow-lg fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">
                {editingJob ? 'Edit Job' : 'Create New Job'}
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
                  Accepted Quotation
                </label>
                <select
                  value={formData.quotation}
                  onChange={(e) => setFormData({ ...formData, quotation: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select an accepted quotation...</option>
                  {quotations.filter(q => q.status === 'accepted').map(quote => (
                    <option key={quote.id} value={quote.id}>
                      Quote #{quote.id} - {quote.customer_name} (₹{parseFloat(quote.total_amount).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-text-secondary mt-1">
                  Only accepted quotations are shown
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Scheduled Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field h-24 resize-none"
                  placeholder="Add any notes about the job..."
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
                  {editingJob ? 'Save Changes' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}