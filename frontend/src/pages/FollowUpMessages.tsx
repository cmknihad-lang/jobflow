import { useState, useEffect } from 'react';
import { Copy, MessageSquare, FileText, CheckCircle, Clock, TrendingUp, Star } from 'lucide-react';
import api from '../lib/axios';
import type { Quotation, Job, Payment } from '../types';

const MESSAGE_TEMPLATES = [
  {
    id: 'quote_sent',
    title: 'Quotation Sent',
    description: 'Send after sharing a quotation with customer',
    icon: FileText,
    generate: (data: any) => `Hi ${data.customerName},

Your quotation for ${data.serviceType} is ready and has been sent.

Total amount: ₹${data.amount?.toLocaleString('en-IN') || 'TBD'}

Please review and let us know if you have any questions.

Best regards,
[Your Business Name]`,
  },
  {
    id: 'job_completed',
    title: 'Job Completed',
    description: 'Send after finishing a job',
    icon: CheckCircle,
    generate: (data: any) => `Hi ${data.customerName},

We're pleased to inform you that your ${data.serviceType} service has been completed.

We hope you're satisfied with the work. Please don't hesitate to reach out if you need anything else.

Best regards,
[Your Business Name]`,
  },
  {
    id: 'payment_reminder',
    title: 'Payment Reminder',
    description: 'Gentle reminder for pending payments',
    icon: Clock,
    generate: (data: any) => `Hi ${data.customerName},

A friendly reminder that payment of ₹${data.amount?.toLocaleString('en-IN') || 'TBD'} is pending for ${data.serviceType}.

You can pay via cash, UPI, or bank transfer.

Best regards,
[Your Business Name]`,
  },
  {
    id: 'review_request',
    title: 'Review Request',
    description: 'Ask for a review after completed service',
    icon: Star,
    generate: (data: any) => `Hi ${data.customerName},

Thank you for choosing us for your ${data.serviceType} needs!

We'd love to hear your feedback about our service. Your review would help us serve you better in the future.

Best regards,
[Your Business Name]`,
  },
];

export default function FollowUpMessages() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('quote_sent');
  const [selectedData, setSelectedData] = useState<any>(null);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quotesRes, jobsRes, paymentsRes] = await Promise.all([
        api.get('/quotations/'),
        api.get('/jobs/'),
        api.get('/payments/'),
      ]);
      setQuotations(quotesRes.data);
      setJobs(jobsRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, templateId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(templateId);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const generateMessage = () => {
    const template = MESSAGE_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return '';

    if (customMessage.trim()) {
      return customMessage;
    }

    let data = {};

    if (selectedData) {
      if (selectedData.type === 'quotation') {
        const quote = quotations.find(q => q.id === selectedData.id);
        if (quote) {
          data = {
            customerName: quote.customer_name,
            serviceType: 'service',
            amount: parseFloat(quote.total_amount),
          };
        }
      } else if (selectedData.type === 'job') {
        const job = jobs.find(j => j.id === selectedData.id);
        if (job) {
          data = {
            customerName: job.customer_name,
            serviceType: job.service,
          };
        }
      } else if (selectedData.type === 'payment') {
        const payment = payments.find(p => p.id === selectedData.id);
        if (payment) {
          data = {
            customerName: payment.customer_name,
            amount: parseFloat(payment.amount),
            serviceType: 'service',
          };
        }
      }
    }

    return template.generate(data);
  };

  const messageText = generateMessage();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-text-primary">
            Follow-up Messages
          </h1>
          <p className="mt-2 text-text-secondary">
            Generate copyable messages for customer communication.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Select Template</h3>
            <div className="space-y-2">
              {MESSAGE_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => { setSelectedTemplate(template.id); setCustomMessage(''); }}
                  className={`flex items-start w-full p-3 text-left rounded-sm transition-all ${
                    selectedTemplate === template.id
                      ? 'bg-surface border border-border shadow-subtle'
                      : 'hover:bg-surface'
                  }`}
                >
                  <template.icon className="h-5 w-5 mr-3 mt-0.5 text-text-secondary" />
                  <div className="flex-1">
                    <div className="font-medium text-text-primary">{template.title}</div>
                    <div className="text-sm text-text-secondary mt-1">{template.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Select Context</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Recent Quotations
                </label>
                <select
                  className="input-field text-sm"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      setSelectedData({ type: 'quotation', id: parseInt(value) });
                    }
                  }}
                >
                  <option value="">Select a quotation...</option>
                  {quotations.map(q => (
                    <option key={q.id} value={q.id}>
                      Quote #{q.id} - {q.customer_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Recent Jobs
                </label>
                <select
                  className="input-field text-sm"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      setSelectedData({ type: 'job', id: parseInt(value) });
                    }
                  }}
                >
                  <option value="">Select a job...</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      Job #{j.id} - {j.customer_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Recent Payments
                </label>
                <select
                  className="input-field text-sm"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      setSelectedData({ type: 'payment', id: parseInt(value) });
                    }
                  }}
                >
                  <option value="">Select a payment...</option>
                  {payments.map(p => (
                    <option key={p.id} value={p.id}>
                      Payment #{p.id} - {p.customer_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Message Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Message Preview</h3>
              <button
                onClick={() => handleCopy(messageText, selectedTemplate)}
                className="flex items-center space-x-2 btn-secondary text-sm"
              >
                {copied === selectedTemplate ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <textarea
                value={customMessage || messageText}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="input-field h-48 resize-none font-mono text-sm"
                placeholder="Your message will appear here..."
              />

              <div className="flex justify-between items-center text-sm text-text-secondary">
                <div>
                  Characters: {messageText.length}
                  {customMessage && customMessage !== messageText && ' (Customized)'}
                </div>
                <button
                  onClick={() => setCustomMessage('')}
                  className="text-accent-red hover:text-accent-red"
                >
                  Reset to Template
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Tips for Effective Messages</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start">
                <MessageSquare className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Personalize messages with customer names and specific details
              </li>
              <li className="flex items-start">
                <TrendingUp className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Send quotations within 24 hours of inquiry for best response rates
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Follow up on payments 3-5 days after sending reminder
              </li>
              <li className="flex items-start">
                <Star className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Request reviews 1-2 days after job completion when satisfaction is highest
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}