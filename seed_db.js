import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

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

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');
    
    // Check if database already has entries
    const count = await Entry.countDocuments();
    if (count === 0) {
      console.log('Creating initial database entry...');
      const newEntry = new Entry({
        id: uuidv4(),
        date: new Date().toISOString().split('T')[0],
        productName: "Initial Setup",
        sellQuantity: 0,
        unitSellingPrice: 0,
        unitCostPrice: 0,
        discount: 0,
        deliveryCost: 0,
        revenue: 0,
        costs: {
          productCost: 0,
          deliveryCost: 0
        },
        totalCosts: 0,
        netProfit: 0,
        notes: "System database initialization record"
      });
      await newEntry.save();
      console.log('Database successfully initialized!');
    } else {
      console.log('Database already has records.');
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seedDatabase();
