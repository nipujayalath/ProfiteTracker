import React from 'react';
import { DailyEntry } from '../types';
import { Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface DataHistoryProps {
  entries: DailyEntry[];
  onDeleteEntry: (id: string) => void;
}

export const DataHistory: React.FC<DataHistoryProps> = ({ entries, onDeleteEntry }) => {
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (entries.length === 0) return null;

  return (
    <div className="card">
      <h3 className="card-title">Recent Deliveries</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Revenue</th>
              <th>Net Profit</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry) => (
              <tr key={entry.id}>
                <td>{format(parseISO(entry.date), 'MMM dd, yyyy')}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{entry.productName || 'Legacy Entry'}</div>
                  {(entry.discount || 0) > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>-Rs {entry.discount} disc</span>}
                </td>
                <td>{entry.sellQuantity || '-'}</td>
                <td style={{ color: 'var(--success)' }}>Rs {entry.revenue?.toFixed(2) || '0.00'}</td>
                <td style={{ fontWeight: 600, color: (entry.netProfit || 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  Rs {(entry.netProfit || 0).toFixed(2)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    onClick={() => onDeleteEntry(entry.id)} 
                    className="btn btn-danger"
                    title="Delete record"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
