import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaTrophy, FaClock, FaGithub, FaCode, FaLink, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { useHackathons } from '../context/HackathonContext';
import { useAuth } from '../context/AuthContext';
import { Hackathon, Participant } from '../types';
import * as hackathonService from '../services/hackathonService';

// Define additional types for the hackathon details page
interface Timeline {
  date: string;
  event: string;
}

interface Prize {
  place: string;
  amount: string;
  description: string;
}

interface Submission {
  id: string;
  teamName: string;
  projectTitle: string;
  description: string;
  githubLink: string;
  demoLink?: string;
  submissionDate: string;
}

// Extended interface that includes both required Hackathon and optional detail fields
interface HackathonDetails extends Omit<Hackathon, 'participants'> {
  longDescription?: string;
  rules?: string[] | string;
  timeline?: Timeline[];
  submissions?: Submission[];
  prizeDetails?: Prize[];
  participantsCount?: number;
  participants?: Participant[];
}

// Add a PaymentUI component at the top level before the HackathonDetails component
interface PaymentUIProps {
  participant: Participant;
  hackathonId: string;
  registrationFee: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentUI = ({ participant, hackathonId, registrationFee, onSuccess, onCancel }: PaymentUIProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      // Extract numeric amount from registration fee (e.g. "₹500" -> 500)
      const amount = parseInt(registrationFee.replace(/[^0-9]/g, ''));
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid registration fee');
      }
      
      // Try to create a payment order
      try {
        const orderResponse = await hackathonService.createPaymentOrder(hackathonId, participant.id, amount);
        console.log('Payment order created:', orderResponse);
        
        // Handling for test/demo environment - simulate success
        if (process.env.NODE_ENV === 'development' || !orderResponse.key_id) {
          console.log('In development mode, simulating payment success');
          // Simulating payment completion for development
          setTimeout(() => {
            setIsProcessing(false);
            onSuccess();
          }, 2000);
          return;
        }
        
        // If we get here, we're in production with Razorpay configured
        // Implement actual Razorpay checkout here
        // This would be replaced with actual Razorpay implementation
      } catch (orderError: any) {
        // Check for specific API errors
        if (orderError.response?.status === 503) {
          console.log('Payment service unavailable, likely in fallback mode');
          // For demo purposes, we'll proceed with a successful payment in fallback mode
          setTimeout(() => {
            setIsProcessing(false);
            onSuccess();
          }, 2000);
          return;
        }
        
        // Other API errors
        console.error('API Error:', orderError.response?.data?.message || orderError.message);
        throw new Error(orderError.response?.data?.message || 'Failed to create payment order');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Complete Registration Payment</h2>
        <p className="mb-4">Registration fee: <span className="font-semibold">{registrationFee}</span></p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const HackathonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allHackathons, deleteHackathon } = useHackathons();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<HackathonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    college: '',
    skills: '',
    experience: '',
    teamName: '',
    teammates: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [registeredParticipant, setRegisteredParticipant] = useState<any>(null);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [showProjectSubmission, setShowProjectSubmission] = useState(false);
  const [projectData, setProjectData] = useState({
    githubLink: '',
    projectDescription: ''
  });
  const [projectSubmissionError, setProjectSubmissionError] = useState('');
  const [projectSubmissionSuccess, setProjectSubmissionSuccess] = useState(false);

  useEffect(() => {
    // Find the hackathon from the context
    if (id && allHackathons) {
      const foundHackathon = allHackathons.find(h => h.id === id);
      if (foundHackathon) {
        // Convert to HackathonDetails type
        const hackathonDetails: HackathonDetails = {
          ...foundHackathon,
          participantsCount: foundHackathon.participants?.length || 0
        };
        setHackathon(hackathonDetails);
        
        // Check if current user is already registered
        if (user && foundHackathon.participants) {
          const userParticipation = foundHackathon.participants.find(p => p.userId === user.id);
          setIsUserRegistered(!!userParticipation);
        }
      } else {
        setHackathon(null);
      }
      setLoading(false);
    }
  }, [id, allHackathons, user]);

  const handleDeleteHackathon = async () => {
    if (!hackathon || !id) return;
    
    if (window.confirm('Are you sure you want to delete this hackathon? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await deleteHackathon(id);
        navigate('/hackathons');
      } catch (error) {
        console.error('Error deleting hackathon:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateRegistrationForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ['name', 'email', 'phone', 'skills'];
    
    requiredFields.forEach(field => {
      if (!registrationData[field as keyof typeof registrationData]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    // Validate email format
    if (registrationData.email && !/\S+@\S+\.\S+/.test(registrationData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegistrationForm()) return;
    
    // Double check the user hasn't already registered
    if (isUserRegistered) {
      setFormErrors(prev => ({
        ...prev,
        submit: 'You have already registered for this hackathon. Check your dashboard for details.'
      }));
      return;
    }

    // Prevent hosts from registering
    if (user?.role === 'host') {
      setFormErrors(prev => ({
        ...prev,
        submit: 'Hosts are not allowed to register for hackathons.'
      }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!user || !hackathon) {
        throw new Error('User not logged in or hackathon not found');
      }
      
      // Create participant object
      const newParticipant: Participant = {
        id: `participant-${Date.now()}`,
        userId: user.id,
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone,
        college: registrationData.college,
        skills: registrationData.skills.split(',').map(skill => skill.trim()),
        experience: registrationData.experience,
        teamName: registrationData.teamName,
        teammates: registrationData.teammates.split(',').map(teammate => teammate.trim()).filter(teammate => teammate !== ''),
        submissionDate: new Date().toISOString(),
        status: 'pending'
      };
      
      // Register participant using the API service instead of directly updating the hackathon
      const response = await hackathonService.registerParticipant(hackathon.id, newParticipant);
      
      // Check if payment is required based on the API response
      if (response.hackathonPaymentRequired) {
        // Show payment UI
        setShowPaymentUI(true);
        setRegisteredParticipant(response);
        // Don't set registration success yet until payment is completed
      } else {
        // No payment required, registration is complete
        setRegistrationSuccess(true);
        setShowRegistrationForm(false);
        
        // Update local state - fetch the updated hackathon to show the new participant
        const updatedHackathon = await hackathonService.getHackathonById(hackathon.id);
        if (updatedHackathon) {
          setHackathon(updatedHackathon);
        }
        
        // Mark user as registered
        setIsUserRegistered(true);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error for already registered user
      if (error.response?.data?.message === 'You have already registered for this hackathon') {
        setFormErrors(prev => ({
          ...prev,
          submit: 'You have already registered for this hackathon'
        }));
        setIsUserRegistered(true);
      } else {
        setFormErrors(prev => ({
          ...prev,
          submit: 'Failed to register. Please try again.'
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!hackathon || !registeredParticipant) return;
    
    // Update hackathon with the newly paid participant
    try {
      const updatedHackathon = await hackathonService.getHackathonById(hackathon.id);
      if (updatedHackathon) {
        setHackathon(updatedHackathon);
      }
      
      // Hide payment UI and show success
      setShowPaymentUI(false);
      setRegistrationSuccess(true);
      
      // Mark user as registered
      setIsUserRegistered(true);
    } catch (error) {
      console.error('Error updating hackathon after payment:', error);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentUI(false);
    // User still registered but payment is pending
    setRegistrationSuccess(true);
  };

  // Add a new function to handle withdrawal
  const handleWithdrawParticipation = async () => {
    if (!user || !hackathon || !id) return;
    
    if (window.confirm('Are you sure you want to withdraw from this hackathon?')) {
      try {
        // Find the participant ID for the current user
        const userParticipant = hackathon.participants?.find(p => p.userId === user.id);
        
        if (!userParticipant) {
          throw new Error('Participant not found');
        }
        
        await hackathonService.withdrawParticipant(id, userParticipant.id);
        // Update local state
        setIsUserRegistered(false);
        setRegistrationSuccess(false);
        
        // Fetch updated hackathon data
        const updatedHackathon = await hackathonService.getHackathonById(id);
        if (updatedHackathon) {
          setHackathon(updatedHackathon);
        }
      } catch (error) {
        console.error('Failed to withdraw from hackathon:', error);
        alert('Failed to withdraw from hackathon. Please try again.');
      }
    }
  };

  const handleRegisterClick = () => {
    // Prevent hosts from registering
    if (user?.role === 'host') {
      return; // Button should be disabled for hosts, but this is an extra safety check
    }
    
    // Show registration form for non-host users
    setShowRegistrationForm(true);
  };

  const handleProjectSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectSubmissionError('');
    setIsSubmitting(true);

    try {
      if (!projectData.githubLink || !projectData.projectDescription) {
        setProjectSubmissionError('Please fill in all fields');
        return;
      }

      // Validate GitHub link format
      if (!projectData.githubLink.match(/^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/)) {
        setProjectSubmissionError('Please enter a valid GitHub repository link');
        return;
      }

      const submission = {
        githubLink: projectData.githubLink,
        projectDescription: projectData.projectDescription,
        submissionDate: new Date().toISOString()
      };

      await hackathonService.submitProject(hackathon!.id, registeredParticipant.id, submission);
      setProjectSubmissionSuccess(true);
      setShowProjectSubmission(false);
    } catch (error: any) {
      setProjectSubmissionError(error.message || 'Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Hackathon Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">The hackathon you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/hackathons"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-semibold transition-colors duration-300"
          >
            Browse Hackathons
          </Link>
        </div>
      </div>
    );
  }

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Calculate if hackathon is active, upcoming, or ended
  const today = new Date();
  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);
  
  let status = 'Upcoming';
  let statusColor = 'bg-yellow-500';
  
  if (today > endDate) {
    status = 'Ended';
    statusColor = 'bg-gray-500';
  } else if (today >= startDate && today <= endDate) {
    status = 'Active';
    statusColor = 'bg-green-500';
  }

  // Check if the current user is the creator of this hackathon
  const isCreator = user && hackathon.creatorId === user.id;

  // Create prizes array if it doesn't exist but we have individual prizes
  const prizesArray = hackathon.prizeDetails || 
    (hackathon.prizes ? [{ place: 'Prize Pool', amount: hackathon.prizes, description: 'Total prize pool' }] : []);

  // Create timeline if it doesn't exist
  const timelineArray = hackathon.timeline || [
    hackathon.registrationDeadline && { date: formatDate(hackathon.registrationDeadline), event: 'Registration Deadline' },
    { date: formatDate(hackathon.startDate), event: 'Hackathon Starts' },
    { date: formatDate(hackathon.endDate), event: 'Submission Deadline' }
  ].filter(Boolean) as Timeline[];

  // Create rules array if it's a string
  const rulesArray = typeof hackathon.rules === 'string' 
    ? hackathon.rules.split('\n').filter(rule => rule.trim() !== '')
    : (hackathon.rules || []);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {showPaymentUI && hackathon && registeredParticipant && (
        <PaymentUI
          participant={registeredParticipant}
          hackathonId={hackathon.id}
          registrationFee={hackathon.registrationFee}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
      
      <div className="bg-gray-50 py-10 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="relative rounded-xl overflow-hidden mb-8">
            <div className="h-80 w-full">
              <img
                src={hackathon.image || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952'}
                alt={hackathon.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            </div>
            
            <div className="absolute bottom-0 left-0 p-8 text-white w-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                  <div className={`${statusColor} text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-3`}>
                    {status}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{hackathon.title}</h1>
                  <p className="text-lg text-gray-200 mb-2">Organized by {hackathon.organizerName || 'Unknown'}</p>
                  <div className="flex items-center text-gray-200 text-sm">
                    <FaCalendarAlt className="mr-1" />
                    <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col space-y-0 md:space-y-3 space-x-3 md:space-x-0">
                  {isCreator && (
                    <div className="flex space-x-2">
                      <Link
                        to={`/create-hackathon/${hackathon.id}`}
                        className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded"
                      >
                        <FaEdit /> Edit
                      </Link>
                      <button
                        onClick={handleDeleteHackathon}
                        disabled={isDeleting}
                        className={`flex items-center gap-1 px-3 py-2 rounded ${
                          isDeleting
                            ? 'bg-red-200 text-red-700 opacity-75'
                            : 'bg-red-100 hover:bg-red-200 text-red-700'
                        }`}
                      >
                        <FaTrash /> {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                  
                  {status === 'Active' && (
                    <button
                      className="bg-indigo-600 opacity-75 cursor-not-allowed text-white px-4 py-2 rounded-md font-semibold transition-colors duration-300 text-center"
                      disabled
                    >
                      Submit Project
                    </button>
                  )}
                  
                  {status === 'Upcoming' && (
                    <>
                      {isUserRegistered ? (
                        <Link
                          to="/dashboard"
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold transition-colors duration-300"
                        >
                          View Registration
                        </Link>
                      ) : user?.role === 'host' ? (
                        <button
                          disabled
                          className="bg-gray-400 cursor-not-allowed text-white px-6 py-3 rounded-md font-semibold"
                          title="Hosts cannot register for hackathons"
                        >
                          Hosts Cannot Register
                        </button>
                      ) : (
                        <button
                          onClick={handleRegisterClick}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold transition-colors duration-300"
                        >
                          Register Now
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex justify-start overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 font-medium text-lg border-b-2 whitespace-nowrap min-w-[120px] text-center ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab('rules')}
                className={`py-4 px-6 font-medium text-lg border-b-2 whitespace-nowrap min-w-[120px] text-center ${
                  activeTab === 'rules'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rules
              </button>
              
              <button
                onClick={() => setActiveTab('prizes')}
                className={`py-4 px-6 font-medium text-lg border-b-2 whitespace-nowrap min-w-[120px] text-center ${
                  activeTab === 'prizes'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Prizes
              </button>
              
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-4 px-6 font-medium text-lg border-b-2 whitespace-nowrap min-w-[120px] text-center ${
                  activeTab === 'timeline'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Timeline
              </button>
              
              <button
                onClick={() => setActiveTab('submissions')}
                className={`py-4 px-6 font-medium text-lg border-b-2 whitespace-nowrap min-w-[120px] text-center ${
                  activeTab === 'submissions'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Submissions
              </button>
            </nav>
          </div>
          
          {/* Content based on active tab */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Hackathon</h2>
                <p className="text-gray-700 mb-6 whitespace-pre-line">{hackathon.longDescription || hackathon.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center text-indigo-600 mb-3">
                      <FaCalendarAlt className="h-6 w-6 mr-2" />
                      <h3 className="text-xl font-semibold">Duration</h3>
                    </div>
                    <p className="text-gray-700">{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center text-indigo-600 mb-3">
                      <FaUsers className="h-6 w-6 mr-2" />
                      <h3 className="text-xl font-semibold">Team Size</h3>
                    </div>
                    <p className="text-gray-700">{hackathon.teamSize || 'No limit'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center text-indigo-600 mb-3">
                      <FaTrophy className="h-6 w-6 mr-2" />
                      <h3 className="text-xl font-semibold">Prize Pool</h3>
                    </div>
                    <p className="text-gray-700">{hackathon.prizes || 'To be announced'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'rules' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Hackathon Rules</h2>
                {rulesArray.length > 0 ? (
                  <ul className="space-y-4">
                    {rulesArray.map((rule: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-indigo-100 text-indigo-800 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{rule}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No specific rules have been provided for this hackathon.</p>
                )}
              </div>
            )}
            
            {activeTab === 'prizes' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Prizes</h2>
                {prizesArray && prizesArray.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {prizesArray.map((prize: Prize, index: number) => (
                      <div key={index} className={`
                        rounded-lg p-6 text-center shadow-md
                        ${index === 0 ? 'bg-gradient-to-b from-yellow-100 to-yellow-50 border border-yellow-300' : ''}
                        ${index === 1 ? 'bg-gradient-to-b from-gray-100 to-gray-50 border border-gray-300' : ''}
                        ${index === 2 ? 'bg-gradient-to-b from-amber-100 to-amber-50 border border-amber-300' : ''}
                        ${index > 2 ? 'bg-white border border-gray-200' : ''}
                      `}>
                        <h3 className="text-xl font-bold mb-2">{prize.place}</h3>
                        <div className="text-3xl font-bold text-indigo-600 mb-2">{prize.amount}</div>
                        <p className="text-gray-600">{prize.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">Prize Information</h3>
                    <p className="text-gray-600">Prize details will be announced soon.</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'timeline' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline</h2>
                <div className="relative border-l-2 border-indigo-200 pl-6 ml-6">
                  {timelineArray.map((item: Timeline, index: number) => (
                    <div key={index} className="mb-10 relative">
                      <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full border-4 border-indigo-200 bg-indigo-600"></div>
                      <div className="text-lg font-semibold text-gray-900">{item.event}</div>
                      <div className="text-gray-600">{item.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'submissions' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Submissions</h2>
                
                {hackathon.submissions && hackathon.submissions.length > 0 ? (
                  <div className="space-y-6">
                    {hackathon.submissions.map((submission: Submission) => (
                      <div key={submission.id} className="bg-gray-50 rounded-lg p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{submission.projectTitle}</h3>
                        <p className="text-gray-600 mb-3">by {submission.teamName}</p>
                        <p className="text-gray-700 mb-4">{submission.description}</p>
                        
                        <div className="flex flex-wrap gap-4">
                          <a 
                            href={submission.githubLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-700 hover:text-indigo-600"
                          >
                            <FaGithub className="mr-2" /> GitHub Repository
                          </a>
                          
                          {submission.demoLink && (
                            <a 
                              href={submission.demoLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-700 hover:text-indigo-600"
                            >
                              <FaLink className="mr-2" /> Live Demo
                            </a>
                          )}
                          
                          <span className="flex items-center text-gray-500 ml-auto">
                            <FaClock className="mr-2" /> Submitted on {new Date(submission.submissionDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <div className="mx-auto h-16 w-16 text-gray-400">
                      <FaCode className="h-full w-full" />
                    </div>
                    <h3 className="mt-4 text-xl font-medium text-gray-900">No submissions yet</h3>
                    <p className="mt-2 text-gray-500">Projects will appear here once they are submitted.</p>
                    
                    {status === 'Active' && (
                      <div className="mt-6">
                        <button
                          className="bg-indigo-600 opacity-75 cursor-not-allowed text-white px-4 py-2 rounded-md font-semibold transition-colors duration-300 text-center"
                          disabled
                        >
                          Submit Your Project
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Registration Status Section */}
          {user && !isCreator && isUserRegistered && (
            <div className="mt-8 bg-green-50 text-green-700 p-6 rounded-lg border border-green-200">
              <div className="flex items-start">
                <div className="bg-green-100 rounded-full p-2 mr-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-2">You're registered for this hackathon!</h3>
                  <p className="text-sm mb-4">Your registration has been successfully submitted. Check your dashboard for status updates and additional information.</p>
                  <div className="flex gap-3">
                    <Link 
                      to="/dashboard" 
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Go to Dashboard
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                    <button 
                      onClick={handleWithdrawParticipation}
                      className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
                    >
                      Withdraw Registration
                    </button>
                    {isUserRegistered && (
                      <button
                        onClick={() => setShowProjectSubmission(true)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        <FaGithub className="mr-2" />
                        Submit Project
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-90vh overflow-y-auto">
            <div className="bg-indigo-600 rounded-t-lg py-4 px-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Register for {hackathon?.title}</h2>
              <button 
                onClick={() => setShowRegistrationForm(false)}
                className="text-white hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleRegistrationSubmit} className="p-6">
              {formErrors.submit && (
                <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md border border-red-200">
                  <p className="font-medium">{formErrors.submit}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={registrationData.name}
                    onChange={handleRegistrationChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="Enter your name"
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={registrationData.email}
                    onChange={handleRegistrationChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="you@example.com"
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                </div>
                
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={registrationData.phone}
                    onChange={handleRegistrationChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="Your phone number"
                  />
                  {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
                </div>
                
                {/* College/University */}
                <div>
                  <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">
                    College/University
                  </label>
                  <input
                    type="text"
                    id="college"
                    name="college"
                    value={registrationData.college}
                    onChange={handleRegistrationChange}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your educational institution"
                  />
                </div>
                
                {/* Skills */}
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Skills*
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={registrationData.skills}
                    onChange={handleRegistrationChange}
                    className={`w-full px-3 py-2 border rounded-md ${formErrors.skills ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="List relevant skills (e.g., React, Python, UI/UX)"
                  />
                  {formErrors.skills && <p className="mt-1 text-sm text-red-500">{formErrors.skills}</p>}
                </div>
                
                {/* Experience */}
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    rows={3}
                    value={registrationData.experience}
                    onChange={handleRegistrationChange}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Briefly describe your relevant experience"
                  />
                </div>
                
                {/* Team Name */}
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    id="teamName"
                    name="teamName"
                    value={registrationData.teamName}
                    onChange={handleRegistrationChange}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your team name (if applicable)"
                  />
                </div>
                
                {/* Team Members */}
                <div>
                  <label htmlFor="teammates" className="block text-sm font-medium text-gray-700 mb-1">
                    Team Members
                  </label>
                  <input
                    type="text"
                    id="teammates"
                    name="teammates"
                    value={registrationData.teammates}
                    onChange={handleRegistrationChange}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="List teammates (if any), separated by commas"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowRegistrationForm(false)}
                  className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Registration Success Modal */}
      {registrationSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">Your registration for {hackathon?.title} has been successfully submitted. The organizer will review your application.</p>
            <button
              onClick={() => setRegistrationSuccess(false)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Project Submission Modal */}
      {showProjectSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="bg-indigo-600 rounded-t-lg py-4 px-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Submit Your Project</h2>
              <button 
                onClick={() => setShowProjectSubmission(false)}
                className="text-white hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleProjectSubmission} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="githubLink" className="block text-sm font-medium text-gray-700">
                    GitHub Repository Link*
                  </label>
                  <input
                    type="url"
                    id="githubLink"
                    name="githubLink"
                    value={projectData.githubLink}
                    onChange={(e) => setProjectData(prev => ({ ...prev, githubLink: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="https://github.com/username/repository"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700">
                    Project Description*
                  </label>
                  <textarea
                    id="projectDescription"
                    name="projectDescription"
                    value={projectData.projectDescription}
                    onChange={(e) => setProjectData(prev => ({ ...prev, projectDescription: e.target.value }))}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Describe your project, its features, and how it solves the hackathon problem..."
                    required
                  />
                </div>

                {projectSubmissionError && (
                  <div className="text-red-600 text-sm">{projectSubmissionError}</div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProjectSubmission(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projectSubmissionSuccess && (
        <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Your project has been successfully submitted! The host will review your submission.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonDetails; 