import { useState, useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { DailyEntryForm } from './components/DailyEntryForm'
import { DataHistory } from './components/DataHistory'
import { DailyEntry } from './types'
import { TrendingUp } from 'lucide-react'

function App() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/entries')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEntries(data);
        } else {
          console.error("API Error or Invalid Data:", data);
        }
      })
      .catch(err => console.error("Failed to fetch entries:", err));
  }, []);

  const handleAddEntry = async (newEntry: DailyEntry) => {
    try {
      const response = await fetch('http://localhost:5000/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });
      if (response.ok) {
        const savedEntry = await response.json();
        setEntries(prev => [...prev, savedEntry]);
      } else {
        console.error("Failed to save entry");
      }
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/entries/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setEntries(prev => prev.filter(entry => entry.id !== id));
        } else {
          console.error("Failed to delete entry");
        }
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-title-container">
          <TrendingUp size={36} color="var(--primary)" />
          <h1 className="header-title">Profit Tracker</h1>
        </div>
        <div style={{ color: 'var(--fg-muted)' }}>
          Keep track of your daily profits and expenses
        </div>
      </header>

      <div className="main-layout">
        <div className="main-content">
          <Dashboard entries={entries} />
          <DataHistory entries={entries} onDeleteEntry={handleDeleteEntry} />
        </div>
        <div className="sidebar">
          <DailyEntryForm onAddEntry={handleAddEntry} />
        </div>
      </div>
    </div>
  )
}

export default App
