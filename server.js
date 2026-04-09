import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Mongoose Schema
const entrySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  productName: { type: String, required: true },
  sellQuantity: { type: Number, required: true },
  unitSellingPrice: { type: Number, required: true },
  unitCostPrice: { type: Number, required: true },
  discount: { type: Number, required: true },
  deliveryCost: { type: Number, required: true },
  revenue: { type: Number, required: true },
  costs: {
    productCost: { type: Number, required: true },
    deliveryCost: { type: Number, required: true }
  },
  totalCosts: { type: Number, required: true },
  netProfit: { type: Number, required: true },
  notes: { type: String }
});

const Entry = mongoose.model('Entry', entrySchema);

// Routes
app.get('/api/entries', async (req, res) => {
  try {
    const entries = await Entry.find().sort({ date: 1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/entries', async (req, res) => {
  try {
    const { id, date, productName, sellQuantity, unitSellingPrice, unitCostPrice, discount, deliveryCost, notes } = req.body;

    // Server-side calculations
    const revenue = (sellQuantity * unitSellingPrice) - discount;
    const productCost = sellQuantity * unitCostPrice;
    const costs = {
      productCost: productCost,
      deliveryCost: deliveryCost
    };
    const totalCosts = productCost + deliveryCost;
    const netProfit = revenue - totalCosts;

    const newEntry = new Entry({
      id,
      date,
      productName,
      sellQuantity,
      unitSellingPrice,
      unitCostPrice,
      discount,
      deliveryCost,
      revenue,
      costs,
      totalCosts,
      netProfit,
      notes
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEntry = await Entry.findOneAndDelete({ id });
    if (!deletedEntry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
