import React, { useState } from 'react';
import { DailyEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { PlusCircle } from 'lucide-react';

interface DailyEntryFormProps {
  onAddEntry: (entry: DailyEntry) => void;
}

export const DailyEntryForm: React.FC<DailyEntryFormProps> = ({ onAddEntry }) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [productName, setProductName] = useState('');
  const [sellQuantity, setSellQuantity] = useState('');
  const [unitSellingPrice, setUnitSellingPrice] = useState('');
  const [unitCostPrice, setUnitCostPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [deliveryCost, setDeliveryCost] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const qty = parseInt(sellQuantity) || 0;
    const sellPrice = parseFloat(unitSellingPrice) || 0;
    const costPrice = parseFloat(unitCostPrice) || 0;
    const disc = parseFloat(discount) || 0;
    const delCost = parseFloat(deliveryCost) || 0;

    const newEntry: DailyEntry = {
      id: uuidv4(),
      date,
      productName,
      sellQuantity: qty,
      unitSellingPrice: sellPrice,
      unitCostPrice: costPrice,
      discount: disc,
      deliveryCost: delCost,
    };

    onAddEntry(newEntry);
    
    // Reset form fields
    setProductName('');
    setSellQuantity('');
    setUnitSellingPrice('');
    setUnitCostPrice('');
    setDiscount('');
    setDeliveryCost('');
  };

  return (
    <div className="card">
      <h3 className="card-title">Add Delivery Record</h3>
      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div className="form-group full-width">
          <label className="form-label">Date</label>
          <input 
            type="date" 
            className="form-input" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">Product Name</label>
          <input 
            type="text" 
            className="form-input" 
            value={productName} 
            onChange={(e) => setProductName(e.target.value)} 
            placeholder="e.g. Dog Food"
            required 
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Quantity Sold</label>
            <input 
              type="number" 
              min="1"
              className="form-input" 
              value={sellQuantity} 
              onChange={(e) => setSellQuantity(e.target.value)} 
              placeholder="1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit Selling Price (Rs)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              className="form-input" 
              value={unitSellingPrice} 
              onChange={(e) => setUnitSellingPrice(e.target.value)} 
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit Buy Price (Rs)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              className="form-input" 
              value={unitCostPrice} 
              onChange={(e) => setUnitCostPrice(e.target.value)} 
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Discount Given (Rs)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              className="form-input" 
              value={discount} 
              onChange={(e) => setDiscount(e.target.value)} 
              placeholder="0.00"
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Delivery Cost (Rs)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              className="form-input" 
              value={deliveryCost} 
              onChange={(e) => setDeliveryCost(e.target.value)} 
              placeholder="0.00"
            />
          </div>
        </div>

        <button type="submit" className="btn" style={{ marginTop: '1.5rem' }}>
          <PlusCircle size={18} />
          Save Delivery
        </button>
      </form>
    </div>
  );
};
