import mongoose from 'mongoose';
import { User } from '../../types';

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['host', 'participant', 'admin'], 
    default: 'participant',
    required: true 
  }
}, {
  timestamps: true
});

export default mongoose.model<User & mongoose.Document>('User', UserSchema); 