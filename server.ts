import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/db/connection';
import { v4 as uuidv4 } from 'uuid';
import { HackathonModel, UserModel, PaymentModel } from './src/db/models';
import { Hackathon, User, Participant, Payment } from './src/types';
import { hackathonsData } from './src/data/hackathons';
import razorpayService from './src/services/razorpay';
import geminiService from './src/services/gemini';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create router for API routes
const router = Router();

// In-memory fallback storage if MongoDB fails
let inMemoryHackathons: Hackathon[] = [];
let isUsingFallback = false;

// Middlewares
app.use(cors());
app.use(express.json());

// Log middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Seed initial data if database is empty
const seedInitialData = async (): Promise<void> => {
  try {
    const count = await HackathonModel.countDocuments();
    if (count === 0) {
      console.log('Seeding initial hackathon data...');
      await HackathonModel.insertMany(hackathonsData);
      console.log('Initial data seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding initial data:', error);
    // Fallback to in-memory data
    isUsingFallback = true;
    inMemoryHackathons = [...hackathonsData];
    console.log('Using in-memory hackathon data as fallback');
  }
};

// Connect to MongoDB and seed data
connectDB()
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedInitialData();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Fallback to in-memory data
    isUsingFallback = true;
    inMemoryHackathons = [...hackathonsData];
    console.log('Using in-memory hackathon data as fallback');
  });

// ROUTES

// Get all hackathons
const getAllHackathons = (req: Request, res: Response): void => {
  if (isUsingFallback) {
    console.log('Using in-memory data for GET /api/hackathons');
    console.log(`Returning ${inMemoryHackathons.length} hackathons from memory`);
    res.status(200).json(inMemoryHackathons);
    return;
  }

  console.log('Fetching hackathons from database...');
  HackathonModel.find().sort({ createdAt: -1 })
    .then(hackathons => {
      console.log(`Found ${hackathons.length} hackathons in database`);
      const plainHackathons = hackathons.map(h => h.toObject());
      res.status(200).json(plainHackathons);
    })
    .catch(error => {
      console.error('Error fetching hackathons:', error);
      // Fallback to in-memory data
      console.log(`Falling back to in-memory: returning ${inMemoryHackathons.length} hackathons`);
      res.status(200).json(inMemoryHackathons);
    });
};

// Get featured hackathons
const getFeaturedHackathons = (req: Request, res: Response): void => {
  if (isUsingFallback) {
    console.log('Using in-memory data for GET /api/hackathons/featured');
    const featured = inMemoryHackathons
      .filter(h => h.featured)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);
    res.status(200).json(featured);
    return;
  }

  HackathonModel.find({ featured: true })
    .sort({ startDate: -1 })
    .limit(5)
    .then(featuredHackathons => {
      res.status(200).json(featuredHackathons);
    })
    .catch(error => {
      console.error('Error fetching featured hackathons:', error);
      // Fallback to in-memory data
      const featured = inMemoryHackathons
        .filter(h => h.featured)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 5);
      res.status(200).json(featured);
    });
};

// Get hackathons by creator ID
const getHackathonsByCreator = (req: Request, res: Response): void => {
  const { creatorId } = req.params;
  
  console.log(`Fetching hackathons for creator: ${creatorId}`);
  
  if (isUsingFallback) {
    console.log(`Using in-memory data for GET /api/hackathons/creator/${creatorId}`);
    const userHackathons = inMemoryHackathons.filter(h => h.creatorId === creatorId);
    console.log(`Found ${userHackathons.length} hackathons for creator ${creatorId} in memory`);
    res.status(200).json(userHackathons);
    return;
  }

  HackathonModel.find({ creatorId })
    .sort({ createdAt: -1 })
    .then(hackathons => {
      console.log(`Found ${hackathons.length} hackathons for creator ${creatorId} in database`);
      
      // Convert MongoDB documents to plain objects
      const plainHackathons = hackathons.map(h => h.toObject());
      res.status(200).json(plainHackathons);
    })
    .catch(error => {
      console.error('Error fetching hackathons by creator:', error);
      // Fallback to in-memory data
      const userHackathons = inMemoryHackathons.filter(h => h.creatorId === creatorId);
      console.log(`Falling back to in-memory: found ${userHackathons.length} hackathons for creator ${creatorId}`);
      res.status(200).json(userHackathons);
    });
};

// Get hackathon by ID
const getHackathonById = (req: Request, res: Response): void => {
  const { id } = req.params;
  
  if (isUsingFallback) {
    console.log(`Using in-memory data for GET /api/hackathons/${id}`);
    const hackathon = inMemoryHackathons.find(h => h.id === id);
    if (!hackathon) {
      res.status(404).json({ message: 'Hackathon not found' });
      return;
    }
    res.status(200).json(hackathon);
    return;
  }

  HackathonModel.findOne({ id })
    .then(hackathon => {
      if (!hackathon) {
        res.status(404).json({ message: 'Hackathon not found' });
        return;
      }
      res.status(200).json(hackathon);
    })
    .catch(error => {
      console.error('Error fetching hackathon by ID:', error);
      // Fallback to in-memory data
      const hackathon = inMemoryHackathons.find(h => h.id === id);
      if (!hackathon) {
        res.status(404).json({ message: 'Hackathon not found' });
        return;
      }
      res.status(200).json(hackathon);
    });
};

// Create new hackathon
const createHackathon = (req: Request, res: Response): void => {
  console.log('Creating new hackathon with data');
  const hackathonData = req.body as Hackathon;
  
  // Always generate new ID to avoid conflicts
  hackathonData.id = uuidv4();
  console.log('Generated new ID for hackathon:', hackathonData.id);
  
  // Provide defaults for empty string values
  if (hackathonData.organizerName === '') hackathonData.organizerName = 'Organizer';
  if (hackathonData.location === '') hackathonData.location = 'Online';
  if (hackathonData.image === '') hackathonData.image = 'https://via.placeholder.com/800x400?text=Hackathon';
  if (hackathonData.prizes === '') hackathonData.prizes = 'To be announced';
  if (hackathonData.teamSize === '') hackathonData.teamSize = '1-5';
  if (hackathonData.registrationFee === '') hackathonData.registrationFee = 'Free';
  if (hackathonData.website === '') hackathonData.website = '#';
  
  // Check if image is a data URL and it's too large (>1MB)
  if (hackathonData.image && hackathonData.image.startsWith('data:image/') && hackathonData.image.length > 1000000) {
    console.warn('Image data URL is too large:', (Number(hackathonData.image.length) / 1000000).toFixed(2) + 'MB');
    // Limit to a reasonable size to prevent MongoDB document size limits
    res.status(400).json({ 
      message: 'Image data is too large. Please use a smaller image or provide a URL instead.',
      error: 'IMAGE_TOO_LARGE' 
    });
    return;
  }
  
  // Set payment required flag based on registration fee
  hackathonData.paymentRequired = hackathonData.registrationFee !== 'Free' && 
    hackathonData.registrationFee !== '0' && 
    hackathonData.registrationFee !== '';
  
  if (isUsingFallback) {
    console.log('Using in-memory data for POST /api/hackathons');
    inMemoryHackathons.push(hackathonData);
    res.status(201).json(hackathonData);
    return;
  }
  
  console.log('Saving hackathon to database with data:', {
    ...hackathonData,
    image: hackathonData.image?.substring(0, 50) + '...' // Log truncated image
  });
  
  const newHackathon = new HackathonModel(hackathonData);
  newHackathon.save()
    .then(savedHackathon => {
      console.log('Successfully saved hackathon to database:', savedHackathon.id);
      res.status(201).json(savedHackathon);
    })
    .catch(error => {
      console.error('Error creating hackathon:', error);
      
      if (error.name === 'ValidationError') {
        // Handle validation errors
        console.log('Validation error detected. Details:', error.errors);
        res.status(400).json({ 
          message: 'Validation error', 
          errors: Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {})
        });
        return;
      }
      
      // Check for MongoDB document size limit error
      if (error.message && error.message.includes('document is larger than the maximum')) {
        res.status(400).json({
          message: 'Hackathon data is too large. Please reduce the size of your image or use an external image URL.',
          error: 'DOCUMENT_TOO_LARGE'
        });
        return;
      }
      
      // For other errors, fallback to in-memory data
      console.log('Falling back to in-memory storage for this hackathon');
      inMemoryHackathons.push(hackathonData);
      res.status(201).json(hackathonData);
    });
};

// Update hackathon
const updateHackathon = (req: Request, res: Response): void => {
  const { id } = req.params;
  const hackathonData = req.body as Hackathon;
  
  if (isUsingFallback) {
    console.log(`Using in-memory data for PUT /api/hackathons/${id}`);
    const index = inMemoryHackathons.findIndex(h => h.id === id);
    if (index === -1) {
      res.status(404).json({ message: 'Hackathon not found' });
      return;
    }
    inMemoryHackathons[index] = { ...inMemoryHackathons[index], ...hackathonData };
    res.status(200).json(inMemoryHackathons[index]);
    return;
  }
  
  HackathonModel.findOneAndUpdate(
    { id },
    hackathonData,
    { new: true }
  )
    .then(updatedHackathon => {
      if (!updatedHackathon) {
        res.status(404).json({ message: 'Hackathon not found' });
        return;
      }
      res.status(200).json(updatedHackathon);
    })
    .catch(error => {
      console.error('Error updating hackathon:', error);
      // Fallback to in-memory data
      const index = inMemoryHackathons.findIndex(h => h.id === id);
      if (index === -1) {
        res.status(404).json({ message: 'Hackathon not found' });
        return;
      }
      inMemoryHackathons[index] = { ...inMemoryHackathons[index], ...hackathonData };
      res.status(200).json(inMemoryHackathons[index]);
    });
};

// Delete hackathon
const deleteHackathon = (req: Request, res: Response): void => {
  const { id } = req.params;
  
  if (isUsingFallback) {
    console.log(`Using in-memory data for DELETE /api/hackathons/${id}`);
    const index = inMemoryHackathons.findIndex(h => h.id === id);
    if (index === -1) {
      res.status(404).json({ message: 'Hackathon not found' });
      return;
    }
    inMemoryHackathons.splice(index, 1);
    res.status(200).json({ message: 'Hackathon deleted successfully' });
    return;
  }
  
  HackathonModel.deleteOne({ id })
    .then(result => {
      if (result.deletedCount === 0) {
        res.status(404).json({ message: 'Hackathon not found' });
        return;
      }
      res.status(200).json({ message: 'Hackathon deleted successfully' });
    })
    .catch(error => {
      console.error('Error deleting hackathon:', error);
      // Fallback to in-memory data
      const index = inMemoryHackathons.findIndex(h => h.id === id);
      if (index === -1) {
        res.status(404).json({ message: 'Hackathon not found' });
        return;
      }
      inMemoryHackathons.splice(index, 1);
      res.status(200).json({ message: 'Hackathon deleted successfully' });
    });
};

// Register participant in hackathon
const registerParticipant = (req: Request, res: Response): void => {
  const { id } = req.params;
  const participantData = req.body as Participant;
  
  // Generate ID for participant if not provided
  if (!participantData.id) {
    participantData.id = uuidv4();
  }
  
  if (isUsingFallback) {
    console.log(`Using in-memory data for POST /api/hackathons/${id}/participants`);
    const index = inMemoryHackathons.findIndex(h => h.id === id);
    if (index === -1) {
      res.status(404).json({ message: 'Hackathon not found' });
      return;
    }
    
    if (!inMemoryHackathons[index].participants) {
      inMemoryHackathons[index].participants = [];
    }
    
    // Check if the user has already registered for this hackathon
    const existingParticipant = inMemoryHackathons[index].participants.find(
      p => p.userId === participantData.userId
    );
    
    if (existingParticipant) {
      res.status(400).json({ message: 'You have already registered for this hackathon' });
      return;
    }
    
    // Check if payment is required
    const paymentRequired = inMemoryHackathons[index].paymentRequired || false;
    participantData.paymentStatus = paymentRequired ? 'pending' : 'not_required';
    
    inMemoryHackathons[index].participants.push(participantData);
    
    // Return payment status along with participant data
    res.status(201).json({
      ...participantData,
      hackathonPaymentRequired: paymentRequired,
      upiId: inMemoryHackathons[index].upiId || ''
    });
    return;
  }
  
  HackathonModel.findOne({ id })
    .then(hackathon => {
      if (!hackathon) {
        throw new Error('Hackathon not found');
      }
      
      // Check if the user has already registered for this hackathon
      const existingParticipant = hackathon.participants?.find(
        p => p.userId === participantData.userId
      );
      
      if (existingParticipant) {
        throw new Error('User already registered');
      }
      
      // Check if payment is required for this hackathon
      const paymentRequired = hackathon.paymentRequired || false;
      participantData.paymentStatus = paymentRequired ? 'pending' : 'not_required';
      
      // Add participant to hackathon
      if (!hackathon.participants) {
        hackathon.participants = [];
      }
      
      hackathon.participants.push(participantData);
      return hackathon.save().then((savedHackathon) => {
        return {
          participant: participantData,
          hackathon: savedHackathon
        };
      });
    })
    .then(result => {
      // Return payment information if required
      res.status(201).json({
        ...result.participant,
        hackathonPaymentRequired: result.hackathon.paymentRequired || false,
        upiId: result.hackathon.upiId || ''
      });
    })
    .catch(error => {
      console.error('Error registering participant:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Hackathon not found') {
          res.status(404).json({ message: 'Hackathon not found' });
          return;
        } else if (error.message === 'User already registered') {
          res.status(400).json({ message: 'You have already registered for this hackathon' });
          return;
        }
      }
      
      // Fallback to in-memory data (with duplicate check)
      const index = inMemoryHackathons.findIndex(h => h.id === id);
      if (index === -1) {
        res.status(404).json({ message: 'Hackathon not found' });
        return;
      }
      
      if (!inMemoryHackathons[index].participants) {
        inMemoryHackathons[index].participants = [];
      }
      
      // Check if user already registered (fallback check)
      const existingParticipant = inMemoryHackathons[index].participants.find(
        p => p.userId === participantData.userId
      );
      
      if (existingParticipant) {
        res.status(400).json({ message: 'You have already registered for this hackathon' });
        return;
      }
      
      const paymentRequired = inMemoryHackathons[index].paymentRequired || false;
      participantData.paymentStatus = paymentRequired ? 'pending' : 'not_required';
      
      inMemoryHackathons[index].participants.push(participantData);
      res.status(201).json({
        ...participantData,
        hackathonPaymentRequired: paymentRequired,
        upiId: inMemoryHackathons[index].upiId || ''
      });
    });
};

// Withdraw participant from hackathon
const withdrawParticipant = (req: Request, res: Response): void => {
  const { hackathonId, participantId } = req.params;
  
  if (isUsingFallback) {
    console.log(`Using in-memory data for DELETE /api/hackathons/${hackathonId}/participants/${participantId}`);
    const index = inMemoryHackathons.findIndex(h => h.id === hackathonId);
    if (index === -1) {
      res.status(404).json({ message: 'Hackathon not found' });
      return;
    }
    
    if (!inMemoryHackathons[index].participants) {
      res.status(404).json({ message: 'Participant not found' });
      return;
    }
    
    // Find the participant
    const participantIndex = inMemoryHackathons[index].participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      res.status(404).json({ message: 'Participant not found' });
      return;
    }
    
    // Remove the participant
    inMemoryHackathons[index].participants.splice(participantIndex, 1);
    
    res.status(200).json({ message: 'Participant withdrawn successfully' });
    return;
  }
  
  HackathonModel.findOne({ id: hackathonId })
    .then(hackathon => {
      if (!hackathon) {
        throw new Error('Hackathon not found');
      }
      
      if (!hackathon.participants) {
        throw new Error('Participant not found');
      }
      
      // Find the participant index
      const participantIndex = hackathon.participants.findIndex(p => p.id === participantId);
      if (participantIndex === -1) {
        throw new Error('Participant not found');
      }
      
      // Remove the participant
      hackathon.participants.splice(participantIndex, 1);
      
      return hackathon.save();
    })
    .then(() => {
      res.status(200).json({ message: 'Participant withdrawn successfully' });
    })
    .catch(error => {
      console.error('Error withdrawing participant:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Hackathon not found') {
          res.status(404).json({ message: 'Hackathon not found' });
          return;
        } else if (error.message === 'Participant not found') {
          res.status(404).json({ message: 'Participant not found' });
          return;
        }
      }
      
      res.status(500).json({ message: 'Failed to withdraw participant' });
    });
};

// Create payment order for hackathon registration
const createPaymentOrder = (req: Request, res: Response): void => {
  const { hackathonId, participantId } = req.params;
  const { amount } = req.body;
  
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    res.status(400).json({ message: 'Invalid payment amount' });
    return;
  }
  
  if (isUsingFallback) {
    res.status(503).json({ message: 'Payment processing not available in fallback mode' });
    return;
  }
  
  // First find the hackathon to ensure it exists and payment is required
  HackathonModel.findOne({ id: hackathonId })
    .then(hackathon => {
      if (!hackathon) {
        throw new Error('Hackathon not found');
      }
      
      if (!hackathon.paymentRequired) {
        throw new Error('Payment not required for this hackathon');
      }
      
      // Find the participant
      const participant = hackathon.participants?.find(p => p.id === participantId);
      if (!participant) {
        throw new Error('Participant not found');
      }
      
      // Generate receipt ID
      const receiptId = razorpayService.generateReceiptId();
      
      // Create Razorpay order
      return razorpayService.createOrder(Number(amount), receiptId)
        .then(order => {
          // Save payment record
          const paymentData: Payment = {
            id: uuidv4(),
            participantId,
            hackathonId,
            amount: Number(amount),
            currency: 'INR',
            status: 'pending',
            orderId: order.id,
            receiptId,
            createdAt: new Date().toISOString()
          };
          
          const newPayment = new PaymentModel(paymentData);
          return newPayment.save().then(payment => {
            return {
              payment,
              order,
              upiId: hackathon.upiId
            };
          });
        });
    })
    .then(result => {
      res.status(201).json({
        success: true,
        order: {
          id: result.order.id,
          amount: result.order.amount / 100, // Convert back to rupees for client
          currency: result.order.currency,
        },
        payment: result.payment,
        upiId: result.upiId,
        key_id: process.env.RAZORPAY_KEY_ID
      });
    })
    .catch(error => {
      console.error('Error creating payment order:', error);
      if (error instanceof Error) {
        if (error.message === 'Hackathon not found') {
          res.status(404).json({ message: 'Hackathon not found' });
          return;
        } else if (error.message === 'Participant not found') {
          res.status(404).json({ message: 'Participant not found' });
          return;
        } else if (error.message === 'Payment not required for this hackathon') {
          res.status(400).json({ message: 'Payment not required for this hackathon' });
          return;
        }
      }
      
      res.status(500).json({ message: 'Failed to create payment order' });
    });
};

// Verify payment after completion
const verifyPayment = (req: Request, res: Response): void => {
  const { paymentId, orderId, signature } = req.body;
  
  if (!paymentId || !orderId || !signature) {
    res.status(400).json({ message: 'Missing payment verification details' });
    return;
  }
  
  if (isUsingFallback) {
    res.status(503).json({ message: 'Payment verification not available in fallback mode' });
    return;
  }
  
  // First verify the payment signature
  const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, signature);
  
  if (!isValid) {
    res.status(400).json({ message: 'Invalid payment signature' });
    return;
  }
  
  // Update payment status
  PaymentModel.findOne({ orderId })
    .then(payment => {
      if (!payment) {
        throw new Error('Payment record not found');
      }
      
      payment.status = 'completed';
      payment.paymentId = paymentId;
      
      return payment.save();
    })
    .then(updatedPayment => {
      // Now update the participant's payment status
      return HackathonModel.findOne({ id: updatedPayment.hackathonId })
        .then(hackathon => {
          if (!hackathon) {
            throw new Error('Hackathon not found');
          }
          
          const participantIndex = hackathon.participants?.findIndex(p => p.id === updatedPayment.participantId);
          if (participantIndex === undefined || participantIndex === -1) {
            throw new Error('Participant not found');
          }
          
          if (hackathon.participants) {
            hackathon.participants[participantIndex].paymentStatus = 'completed';
            hackathon.participants[participantIndex].paymentId = paymentId;
          }
          
          return hackathon.save().then(() => updatedPayment);
        });
    })
    .then(payment => {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment
      });
    })
    .catch(error => {
      console.error('Error verifying payment:', error);
      if (error instanceof Error) {
        if (error.message === 'Payment record not found') {
          res.status(404).json({ message: 'Payment record not found' });
          return;
        } else if (error.message === 'Hackathon not found') {
          res.status(404).json({ message: 'Hackathon not found' });
          return;
        } else if (error.message === 'Participant not found') {
          res.status(404).json({ message: 'Participant not found' });
          return;
        }
      }
      
      res.status(500).json({ message: 'Failed to verify payment' });
    });
};

// Update hackathon UPI details
const updateHackathonPaymentDetails = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { upiId, paymentRequired } = req.body;
  
  if (isUsingFallback) {
    const index = inMemoryHackathons.findIndex(h => h.id === id);
    if (index === -1) {
      res.status(404).json({ message: 'Hackathon not found' });
      return;
    }
    
    if (upiId !== undefined) {
      inMemoryHackathons[index].upiId = upiId;
    }
    
    if (paymentRequired !== undefined) {
      inMemoryHackathons[index].paymentRequired = paymentRequired;
    }
    
    res.status(200).json(inMemoryHackathons[index]);
    return;
  }
  
  HackathonModel.findOne({ id })
    .then(hackathon => {
      if (!hackathon) {
        throw new Error('Hackathon not found');
      }
      
      if (upiId !== undefined) {
        hackathon.upiId = upiId;
      }
      
      if (paymentRequired !== undefined) {
        hackathon.paymentRequired = paymentRequired;
      }
      
      return hackathon.save();
    })
    .then(updatedHackathon => {
      res.status(200).json(updatedHackathon);
    })
    .catch(error => {
      console.error('Error updating hackathon payment details:', error);
      if (error instanceof Error && error.message === 'Hackathon not found') {
        res.status(404).json({ message: 'Hackathon not found' });
        return;
      }
      
      res.status(500).json({ message: 'Failed to update hackathon payment details' });
    });
};

// Submit project
const submitProject = async (req: Request, res: Response): Promise<void> => {
  const { hackathonId, participantId, githubLink, projectDescription } = req.body;

  try {
    const hackathon = await HackathonModel.findOne({ id: hackathonId });
    if (!hackathon) {
      res.status(404).json({ error: 'Hackathon not found' });
      return;
    }

    const participant = hackathon.participants.find(p => p.id === participantId);
    if (!participant) {
      res.status(404).json({ error: 'Participant not found' });
      return;
    }

    participant.projectSubmission = {
      githubLink,
      projectDescription,
      submissionDate: new Date()
    };

    await hackathon.save();
    res.status(200).json({ message: 'Project submitted successfully' });
  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(500).json({ error: 'Failed to submit project' });
  }
};

// Evaluate project
const evaluateProject = async (req: Request, res: Response): Promise<void> => {
  const { hackathonId, participantId } = req.body;
  const evaluatorId = req.body.userId; // Assuming this comes from auth middleware

  try {
    const hackathon = await HackathonModel.findOne({ id: hackathonId });
    if (!hackathon) {
      res.status(404).json({ error: 'Hackathon not found' });
      return;
    }

    const participant = hackathon.participants.find(p => p.id === participantId);
    if (!participant || !participant.projectSubmission) {
      res.status(404).json({ error: 'Project submission not found' });
      return;
    }

    const evaluation = await geminiService.evaluateProject(
      participant.projectSubmission.projectDescription,
      participant.projectSubmission.githubLink
    );

    participant.projectSubmission.evaluation = {
      ...evaluation,
      evaluatedBy: evaluatorId,
      evaluatedAt: new Date()
    };

    await hackathon.save();
    res.status(200).json({ message: 'Project evaluated successfully', evaluation });
  } catch (error) {
    console.error('Error evaluating project:', error);
    res.status(500).json({ error: 'Failed to evaluate project' });
  }
};

// Rank all projects in a hackathon
const rankHackathonProjects = async (req: Request, res: Response): Promise<void> => {
  const { hackathonId } = req.params;

  try {
    const hackathon = await HackathonModel.findOne({ id: hackathonId });
    if (!hackathon) {
      res.status(404).json({ error: 'Hackathon not found' });
      return;
    }

    // Get all submitted projects
    const submittedProjects = hackathon.participants
      .filter(p => p.projectSubmission)
      .map(p => ({
        description: p.projectSubmission!.projectDescription,
        githubLink: p.projectSubmission!.githubLink
      }));

    if (submittedProjects.length === 0) {
      res.status(400).json({ error: 'No projects submitted for ranking' });
      return;
    }

    const rankings = await geminiService.rankProjects(submittedProjects);

    // Update project rankings in the hackathon
    rankings.forEach(ranking => {
      const participant = hackathon.participants.find(p => 
        p.projectSubmission?.githubLink === submittedProjects[ranking.index].githubLink
      );
      if (participant && participant.projectSubmission) {
        participant.projectSubmission.ranking = {
          rank: ranking.index + 1,
          score: ranking.score,
          feedback: ranking.feedback,
          rankedAt: new Date()
        };
      }
    });

    await hackathon.save();
    res.status(200).json({ 
      message: 'Projects ranked successfully',
      rankings: rankings.map(r => ({
        ...r,
        project: submittedProjects[r.index]
      }))
    });
  } catch (error) {
    console.error('Error ranking projects:', error);
    res.status(500).json({ error: 'Failed to rank projects' });
  }
};

// Get participant analytics
const getParticipantAnalytics = async (req: Request, res: Response): Promise<void> => {
  const { hackathonId } = req.params;

  try {
    const hackathon = await HackathonModel.findOne({ id: hackathonId });
    if (!hackathon) {
      res.status(404).json({ error: 'Hackathon not found' });
      return;
    }

    const analytics = {
      totalParticipants: hackathon.participants.length,
      universities: {} as Record<string, number>,
      submissionStats: {
        total: 0,
        evaluated: 0,
        averageScore: 0
      }
    };

    // Calculate university distribution
    hackathon.participants.forEach(participant => {
      if (participant.university) {
        analytics.universities[participant.university] = (analytics.universities[participant.university] || 0) + 1;
      }
    });

    // Calculate submission statistics
    hackathon.participants.forEach(participant => {
      if (participant.projectSubmission) {
        analytics.submissionStats.total++;
        if (participant.projectSubmission.evaluation) {
          analytics.submissionStats.evaluated++;
          analytics.submissionStats.averageScore += participant.projectSubmission.evaluation.score;
        }
      }
    });

    if (analytics.submissionStats.evaluated > 0) {
      analytics.submissionStats.averageScore /= analytics.submissionStats.evaluated;
    }

    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error getting participant analytics:', error);
    res.status(500).json({ error: 'Failed to get participant analytics' });
  }
};

// Register routes
router.get('/hackathons', getAllHackathons);
router.get('/hackathons/featured', getFeaturedHackathons);
router.get('/hackathons/creator/:creatorId', getHackathonsByCreator);
router.get('/hackathons/:id', getHackathonById);
router.post('/hackathons', createHackathon);
router.put('/hackathons/:id', updateHackathon);
router.delete('/hackathons/:id', deleteHackathon);
router.post('/hackathons/:id/participants', registerParticipant);
router.delete('/hackathons/:hackathonId/participants/:participantId', withdrawParticipant);

// Payment routes
router.put('/hackathons/:id/payment-details', updateHackathonPaymentDetails);
router.post('/payments/create/:hackathonId/:participantId', createPaymentOrder);
router.post('/payments/verify', verifyPayment);

// Add new routes
router.post('/hackathons/:hackathonId/submit-project', submitProject);
router.post('/hackathons/:hackathonId/evaluate-project', evaluateProject);
router.post('/hackathons/:hackathonId/rank-projects', rankHackathonProjects);
router.get('/hackathons/:hackathonId/analytics', getParticipantAnalytics);

// Mount the router to the /api path
app.use('/api', router);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (isUsingFallback) {
    console.warn('\n⚠️ WARNING: Using in-memory storage as MongoDB connection failed ⚠️');
    console.warn('Data will not persist between server restarts');
    console.warn('To use MongoDB, please check your connection settings in the .env file\n');
  }
}); 