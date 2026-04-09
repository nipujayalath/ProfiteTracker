import { useState, useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { DailyEntryForm } from './components/DailyEntryForm'
import { DataHistory } from './components/DataHistory'
import { DailyEntry } from './types'
import { TrendingUp } from 'lucide-react'

function App() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

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

  const handleDeleteEntry = (id: string) => {
    setEntryToDelete(id);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      const response = await fetch(`http://localhost:5000/api/entries/${entryToDelete}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setEntries(prev => prev.filter(entry => entry.id !== entryToDelete));
      } else {
        console.error("Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
    setEntryToDelete(null);
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

      {entryToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this record?</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setEntryToDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
