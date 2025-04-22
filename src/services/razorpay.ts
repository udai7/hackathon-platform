import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Initialize Razorpay with API keys from environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

/**
 * Create a new Razorpay order
 * @param amount Amount in paise (INR)
 * @param receiptId Receipt ID for the order
 * @returns Promise with Razorpay order details
 */
export const createOrder = async (amount: number, receiptId: string) => {
  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: receiptId,
      payment_capture: 1 // Auto-capture payment
    };

    return await razorpay.orders.create(options);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 * @param orderId Razorpay order ID
 * @param paymentId Razorpay payment ID
 * @param signature Razorpay signature from callback
 * @returns Boolean indicating if signature is valid
 */
export const verifyPaymentSignature = (orderId: string, paymentId: string, signature: string) => {
  try {
    // Generate signature based on the order ID and payment ID
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(orderId + '|' + paymentId);
    const generatedSignature = hmac.digest('hex');
    
    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return false;
  }
};

/**
 * Generate a unique receipt ID for Razorpay
 * @returns String receipt ID
 */
export const generateReceiptId = () => {
  return `rcpt_${uuidv4().replace(/-/g, '').substring(0, 10)}`;
};

export default {
  createOrder,
  verifyPaymentSignature,
  generateReceiptId
}; 