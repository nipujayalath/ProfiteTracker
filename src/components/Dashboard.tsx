import React, { useState, useMemo } from 'react';
import { DailyEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, PieChart as PieChartIcon, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface DashboardProps {
  entries: DailyEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  const [timeFilter, setTimeFilter] = useState<'daily' | 'monthly' | 'yearly' | 'custom'>('daily');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Sort and filter entries
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];
    if (timeFilter === 'custom' && startDate && endDate) {
      filtered = filtered.filter(entry => {
        return entry.date >= startDate && entry.date <= endDate;
      });
    }
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries, timeFilter, startDate, endDate]);

  // Aggregate data for Recharts based on Time Filter
  const chartData = useMemo(() => {
    const aggregates: Record<string, any> = {};

    filteredEntries.forEach(entry => {
      const dateObj = parseISO(entry.date);
      let formattedDate = '';

      if (timeFilter === 'daily' || timeFilter === 'custom') formattedDate = format(dateObj, 'MMM dd');
      else if (timeFilter === 'monthly') formattedDate = format(dateObj, 'MMM yyyy');
      else if (timeFilter === 'yearly') formattedDate = format(dateObj, 'yyyy');

      if (!aggregates[formattedDate]) {
        aggregates[formattedDate] = {
          formattedDate,
          revenue: 0,
          netProfit: 0,
          productCost: 0,
          deliveryCost: 0
        };
      }
      aggregates[formattedDate].revenue += entry.revenue;
      aggregates[formattedDate].netProfit += entry.netProfit;
      aggregates[formattedDate].productCost += (entry.costs?.productCost || 0);
      aggregates[formattedDate].deliveryCost += (entry.costs?.deliveryCost || 0);
    });

    return Object.values(aggregates);
  }, [filteredEntries, timeFilter]);

  let displayRevenue = 0;
  let displayCosts = 0;
  let displayProfit = 0;
  let periodLabel = '';

  if (timeFilter === 'custom') {
    // For custom ranges, show the total SUM of the selected range instead of the "latest bucket"
    displayRevenue = filteredEntries.reduce((sum, e) => sum + (e.revenue || 0), 0);
    displayCosts = filteredEntries.reduce((sum, e) => sum + (e.totalCosts || 0), 0);
    displayProfit = displayRevenue - displayCosts;
    periodLabel = 'Custom Range';
  } else {
    // For specific views, show the latest bucket so the user knows what "Today" or "This Month" means
    const latestData = chartData.length > 0 ? chartData[chartData.length - 1] : null;
    displayRevenue = latestData ? latestData.revenue : 0;
    displayCosts = latestData ? (latestData.productCost + latestData.deliveryCost) : 0;
    displayProfit = latestData ? latestData.netProfit : 0;
    periodLabel = latestData ? latestData.formattedDate : '';
  }

  // Export detailed data to CSV
  const exportToCSV = () => {
    if (filteredEntries.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ['Date', 'Product Name', 'Quantity', 'Unit Sell Price (Rs)', 'Unit Cost (Rs)', 'Discount (Rs)', 'Delivery Cost (Rs)', 'Revenue (Rs)', 'Net Profit (Rs)'];
    const csvRows = [headers.join(',')];

    filteredEntries.forEach(row => {
      const values = [
        `"${row.date}"`,
        `"${row.productName || 'Legacy Entry'}"`,
        row.sellQuantity || 0,
        (row.unitSellingPrice || 0).toFixed(2),
        (row.unitCostPrice || 0).toFixed(2),
        (row.discount || 0).toFixed(2),
        (row.costs?.deliveryCost || row.deliveryCost || 0).toFixed(2),
        (row.revenue || 0).toFixed(2),
        (row.netProfit || 0).toFixed(2)
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Profit_Detailed_Report_${timeFilter}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard">
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem 1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label className="form-label" style={{ margin: 0 }}>View:</label>
          <select
            className="form-input"
            style={{ width: 'auto', padding: '0.5rem' }}
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>

        {timeFilter === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Start:</label>
              <input type="date" className="form-input" style={{ width: 'auto', padding: '0.5rem' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>End:</label>
              <input type="date" className="form-input" style={{ width: 'auto', padding: '0.5rem' }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ marginLeft: 'auto' }}>
          <button onClick={exportToCSV} className="btn" style={{ background: 'var(--bg-secondary)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
            <Download size={16} style={{ marginRight: '0.5rem' }} />
            Download Report
          </button>
        </div>
      </div>

      <div className="card dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign className="metric-title" size={16} />
            <span className="metric-title">Revenue {periodLabel && <span style={{ fontWeight: 'normal', opacity: 0.7 }}>({periodLabel})</span>}</span>
          </div>
          <span className="metric-value">Rs {displayRevenue.toFixed(2)}</span>
        </div>
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChartIcon className="metric-title" size={16} />
            <span className="metric-title">Costs {periodLabel && <span style={{ fontWeight: 'normal', opacity: 0.7 }}>({periodLabel})</span>}</span>
          </div>
          <span className="metric-value negative">Rs {displayCosts.toFixed(2)}</span>
        </div>
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp className="metric-title" size={16} />
            <span className="metric-title">Net Profit {periodLabel && <span style={{ fontWeight: 'normal', opacity: 0.7 }}>({periodLabel})</span>}</span>
          </div>
          <span className={`metric-value ${displayProfit >= 0 ? 'positive' : 'negative'}`}>
            Rs {displayProfit.toFixed(2)}
          </span>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 className="card-title">
            <TrendingUp size={20} />
            Profit Trend
            <span style={{ fontSize: '0.875rem', color: 'var(--fg-muted)', marginLeft: '1rem', fontWeight: 400 }}>
              ({timeFilter === 'daily' ? 'Daily' : timeFilter === 'monthly' ? 'Monthly' : timeFilter === 'yearly' ? 'Yearly' : 'Custom'} view)
            </span>
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="formattedDate" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#f8fafc' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Legend />
                <Bar dataKey="netProfit" fill="#10b981" name="Net Profit (Rs)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {chartData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: 'var(--fg-muted)', fontSize: '1.125rem' }}>No data matches the current filters.</p>
        </div>
      ) : null}
    </div>
  );
};
