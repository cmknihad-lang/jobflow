import { Users, UserPlus, Briefcase, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';

const stats = [
  {
    name: 'Total Customers',
    value: '127',
    change: '+12%',
    changeLabel: 'vs last month',
    icon: Users,
    color: 'text-status-blue',
    bg: 'bg-status-blue-bg',
  },
  {
    name: 'New Leads',
    value: '24',
    change: '+5',
    changeLabel: 'this week',
    icon: UserPlus,
    color: 'text-status-purple',
    bg: 'bg-status-purple-bg',
  },
  {
    name: 'Active Jobs',
    value: '8',
    change: '2 completing',
    changeLabel: 'soon',
    icon: Briefcase,
    color: 'text-status-yellow',
    bg: 'bg-status-yellow-bg',
  },
  {
    name: 'Revenue',
    value: '$12,450',
    change: '+8%',
    changeLabel: 'vs last month',
    icon: DollarSign,
    color: 'text-status-green',
    bg: 'bg-status-green-bg',
  },
];

const recentActivity = [
  { id: 1, type: 'lead',    message: 'New lead from Rahul - AC Repair',       time: '2h ago',    dot: 'bg-status-purple' },
  { id: 2, type: 'job',     message: 'Job completed for Suresh - Plumbing',   time: '4h ago',    dot: 'bg-status-green'  },
  { id: 3, type: 'payment', message: 'Payment received from Priya - $350',    time: '5h ago',    dot: 'bg-status-blue'   },
  { id: 4, type: 'quote',   message: 'Quotation sent to Anitha',              time: '1 day ago', dot: 'bg-status-yellow' },
];

export default function Dashboard() {
  return (
    <div className="space-y-7 fade-in-up">

      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Here's what's happening with your business today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card-sm flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-text-secondary">{stat.name}</p>
              <div className={`h-8 w-8 rounded-sm ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-text-primary tracking-tight">{stat.value}</p>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-status-green" strokeWidth={2} />
              <span className="font-medium text-status-green">{stat.change}</span>
              <span className="text-text-muted">{stat.changeLabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Recent activity */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Recent Activity</h2>
            <button className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors font-medium">
              View all
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-0">
            {recentActivity.map((activity, i) => (
              <div
                key={activity.id}
                className={`flex items-center gap-3 py-3 ${
                  i < recentActivity.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${activity.dot}`} aria-hidden="true" />
                <p className="flex-1 text-sm text-text-primary">{activity.message}</p>
                <span className="text-xs text-text-muted flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats panel */}
        <div className="card">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Pipeline Status</h2>
          <div className="space-y-3">
            {[
              { label: 'New leads',     count: 8,  color: 'bg-status-purple' },
              { label: 'In progress',   count: 5,  color: 'bg-status-yellow' },
              { label: 'Quoted',        count: 4,  color: 'bg-status-blue'   },
              { label: 'Won this month',count: 7,  color: 'bg-status-green'  },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${item.color}`} aria-hidden="true" />
                  <span className="text-sm text-text-secondary">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-text-primary">{item.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-xs text-text-muted mb-2">Conversion rate</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-semibold text-text-primary">64%</span>
              <span className="text-xs text-status-green font-medium pb-0.5">+4% this month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
