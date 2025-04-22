import mongoose from 'mongoose';
import { Payment } from '../../types';

// Create the payment schema
const PaymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  participantId: { type: String, required: true },
  hackathonId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending',
    required: true 
  },
  orderId: { type: String, required: true },
  paymentId: { type: String },
  receiptId: { type: String, required: true },
  createdAt: { type: String, required: true }
}, {
  timestamps: true
});

// Create and export the model
export default mongoose.model<Payment & mongoose.Document>('Payment', PaymentSchema); 