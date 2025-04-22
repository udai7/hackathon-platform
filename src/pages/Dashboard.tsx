import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaUsers, FaCheckCircle, FaTimesCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useHackathons } from '../context/HackathonContext';
import { Participant, Hackathon } from '../types';
import * as hackathonService from '../services/hackathonService';

// Remove unused sample data
// const myHackathonsData = [...];
// const mySubmissionsData = [...];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { userHackathons, deleteHackathon, allHackathons, addHackathon, updateHackathon } = useHackathons();
  
  const [activeTab, setActiveTab] = useState('my-hackathons');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedHackathon, setSelectedHackathon] = useState<string | null>(null);
  const [activeParticipantTab, setActiveParticipantTab] = useState('pending');
  const [myParticipations, setMyParticipations] = useState<{hackathon: Hackathon, participant: Participant}[]>([]);
  const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);
  const [activeSubmissionTab, setActiveSubmissionTab] = useState('pending');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Add sample data if no hackathons exist
  useEffect(() => {
    if (user && allHackathons.length === 0) {
      try {
        // If no hackathons at all, add some sample data
        const sampleHackathons = [
          {
            id: '1',
            title: 'AI Innovation Challenge',
            description: 'Develop AI solutions for real-world problems',
            startDate: '2023-12-01',
            endDate: '2023-12-15',
            registrationDeadline: '2023-11-25',
            organizerName: 'Tech Innovators',
            category: 'Artificial Intelligence',
            location: 'Online',
            image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=1470&auto=format&fit=crop',
            prizes: '₹50,000 in prizes',
            teamSize: '1-4',
            registrationFee: 'Free',
            website: 'https://example.com/ai-challenge',
            creatorId: user.id,
            featured: true,
            participants: []
          },
          {
            id: '2',
            title: 'HealthTech Hackathon',
            description: 'Create innovative solutions for healthcare challenges',
            startDate: '2023-12-10',
            endDate: '2023-12-12',
            registrationDeadline: '2023-12-05',
            organizerName: 'Health Innovate',
            category: 'Healthcare',
            location: 'New Delhi, India',
            image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1470&auto=format&fit=crop',
            prizes: '₹25,000 in prizes',
            teamSize: '2-5',
            registrationFee: '₹200',
            website: 'https://example.com/healthtech',
            creatorId: '2',
            featured: true,
            participants: []
          }
        ];
        
        // Add sample hackathons
        sampleHackathons.forEach((hackathon) => {
          addHackathon(hackathon);
        });
      } catch (error) {
        console.error('Error adding sample hackathons:', error);
      }
    }
  }, [user, allHackathons, addHackathon]);
  
  // Get all hackathons where the user is a participant
  useEffect(() => {
    if (user && user.role === 'participant' && allHackathons.length > 0) {
      const participations = allHackathons
        .filter(hackathon => 
          hackathon.participants?.some(participant => participant.userId === user.id)
        )
        .map(hackathon => {
          const participant = hackathon.participants?.find(p => p.userId === user.id);
          if (participant) {
            return { hackathon, participant };
          }
          return null;
        })
        .filter(item => item !== null) as {hackathon: Hackathon, participant: Participant}[];
      
      setMyParticipations(participations);
    }
  }, [user, allHackathons]);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleDeleteHackathon = async (hackathonId: string) => {
    if (window.confirm('Are you sure you want to delete this hackathon?')) {
      setIsDeleting(hackathonId);
      try {
        await deleteHackathon(hackathonId);
      } catch (error) {
        console.error('Error deleting hackathon:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleEditHackathon = (hackathonId: string) => {
    navigate(`/create-hackathon/${hackathonId}`);
  };

  const handleParticipantAction = (hackathonId: string, participantId: string, status: 'approved' | 'rejected') => {
    const hackathon = userHackathons.find(h => h.id === hackathonId);
    if (!hackathon) return;

    const updatedParticipants = hackathon.participants?.map(participant => 
      participant.id === participantId ? { ...participant, status } : participant
    );

    const updatedHackathon = {
      ...hackathon,
      participants: updatedParticipants
    };

    updateHackathon(updatedHackathon);
  };

  const getFilteredParticipants = (hackathonId: string, status: string) => {
    const hackathon = userHackathons.find(h => h.id === hackathonId);
    if (!hackathon || !hackathon.participants || hackathon.participants.length === 0) {
      return [];
    }

    if (status === 'all') {
      return hackathon.participants;
    }

    return hackathon.participants.filter(p => p.status === status);
  };

  const handleDeleteAnyHackathon = async (hackathonId: string) => {
    if (window.confirm('Are you sure you want to delete this hackathon? This is an admin action.')) {
      setIsDeleting(hackathonId);
      try {
        await deleteHackathon(hackathonId);
      } catch (error) {
        console.error('Error deleting hackathon:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  // New function to handle withdrawal from a hackathon
  const handleWithdraw = async (hackathonId: string, participantId: string) => {
    if (window.confirm('Are you sure you want to withdraw from this hackathon?')) {
      setIsWithdrawing(hackathonId);
      try {
        await hackathonService.withdrawParticipant(hackathonId, participantId);
        
        // Update local state to reflect the withdrawal
        setMyParticipations(prev => 
          prev.filter(p => !(p.hackathon.id === hackathonId && p.participant.id === participantId))
        );
        
      } catch (error) {
        console.error('Error withdrawing from hackathon:', error);
        alert('Failed to withdraw from the hackathon. Please try again.');
      } finally {
        setIsWithdrawing(null);
      }
    }
  };
  
  const handleSubmitProject = (hackathonId: string, participantId: string) => {
    navigate(`/hackathon/${hackathonId}/submit-project/${participantId}`);
  };

  const getSubmissionStatus = (participant: Participant) => {
    if (!participant.projectSubmission) {
      return 'Not Submitted';
    }
    if (participant.projectSubmission.evaluation) {
      return `Evaluated (Score: ${participant.projectSubmission.evaluation.score})`;
    }
    return 'Submitted';
  };
  
  if (!user) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome, {user.name || 'User'}!</p>
          <p className="text-gray-600">Role: <span className="capitalize">{user.role}</span></p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          {user.role === 'host' && (
            <Link
              to="/create-hackathon"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              <FaPlus /> Create Hackathon
            </Link>
          )}
          <button
            onClick={() => logout()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'my-hackathons'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('my-hackathons')}
            >
              {user.role === 'host' ? 'My Hackathons' : 'Registered Hackathons'}
            </button>
            {user.role === 'admin' && (
              <button
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'all-hackathons'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('all-hackathons')}
              >
                All Hackathons
              </button>
            )}
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'account'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('account')}
            >
              Account Settings
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'my-hackathons' && (
            <div>
              {user.role === 'host' ? (
                userHackathons && userHackathons.length > 0 ? (
                  <div className="space-y-6">
                    {userHackathons.map(hackathon => (
                      <div key={hackathon.id} className="border rounded-lg overflow-hidden shadow-sm">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4 h-48 md:h-auto">
                            <img
                              src={hackathon.image || 'https://via.placeholder.com/300x200?text=Hackathon'}
                              alt={hackathon.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <h3 className="text-xl font-bold mb-2">{hackathon.title}</h3>
                                <p className="text-gray-600 mb-4">
                                  {hackathon.description && hackathon.description.substring(0, 150)}...
                                </p>
                                <div className="flex items-center text-gray-500 mb-2">
                                  <FaCalendarAlt className="mr-2" />
                                  {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                                </div>
                                <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {hackathon.category}
                                </div>
                                {hackathon.participants && hackathon.participants.length > 0 && (
                                  <div className="mt-2 flex items-center text-gray-500">
                                    <FaUsers className="mr-2" /> 
                                    {hackathon.participants.length} Participants
                                  </div>
                                )}
                              </div>
                              <div className="flex mt-4 md:mt-0 space-x-2">
                                <button
                                  onClick={() => handleEditHackathon(hackathon.id)}
                                  className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded"
                                >
                                  <FaEdit /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteHackathon(hackathon.id)}
                                  disabled={isDeleting === hackathon.id}
                                  className={`flex items-center gap-1 px-3 py-2 rounded ${
                                    isDeleting === hackathon.id
                                      ? 'bg-red-200 text-red-700 opacity-75'
                                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                                  }`}
                                >
                                  <FaTrash /> {isDeleting === hackathon.id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Participants section for host */}
                        {user.role === 'host' && hackathon.participants && hackathon.participants.length > 0 && (
                          <div className="border-t border-gray-200 p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-lg font-medium">Participants</h4>
                              <button
                                onClick={() => setSelectedHackathon(selectedHackathon === hackathon.id ? null : hackathon.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                {selectedHackathon === hackathon.id ? 'Hide Participants' : 'Show Participants'}
                              </button>
                            </div>
                            
                            {selectedHackathon === hackathon.id && (
                              <div>
                                <div className="mb-4 border-b border-gray-200">
                                  <nav className="flex">
                                    <button
                                      className={`px-4 py-2 text-sm font-medium ${
                                        activeParticipantTab === 'all'
                                          ? 'border-b-2 border-blue-500 text-blue-600'
                                          : 'text-gray-500 hover:text-gray-700'
                                      }`}
                                      onClick={() => setActiveParticipantTab('all')}
                                    >
                                      All ({hackathon.participants.length})
                                    </button>
                                    <button
                                      className={`px-4 py-2 text-sm font-medium ${
                                        activeParticipantTab === 'pending'
                                          ? 'border-b-2 border-blue-500 text-blue-600'
                                          : 'text-gray-500 hover:text-gray-700'
                                      }`}
                                      onClick={() => setActiveParticipantTab('pending')}
                                    >
                                      Pending ({hackathon.participants.filter(p => p.status === 'pending').length})
                                    </button>
                                    <button
                                      className={`px-4 py-2 text-sm font-medium ${
                                        activeParticipantTab === 'approved'
                                          ? 'border-b-2 border-blue-500 text-blue-600'
                                          : 'text-gray-500 hover:text-gray-700'
                                      }`}
                                      onClick={() => setActiveParticipantTab('approved')}
                                    >
                                      Approved ({hackathon.participants.filter(p => p.status === 'approved').length})
                                    </button>
                                    <button
                                      className={`px-4 py-2 text-sm font-medium ${
                                        activeParticipantTab === 'rejected'
                                          ? 'border-b-2 border-blue-500 text-blue-600'
                                          : 'text-gray-500 hover:text-gray-700'
                                      }`}
                                      onClick={() => setActiveParticipantTab('rejected')}
                                    >
                                      Rejected ({hackathon.participants.filter(p => p.status === 'rejected').length})
                                    </button>
                                  </nav>
                                </div>
                                
                                {getFilteredParticipants(hackathon.id, activeParticipantTab).length > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {getFilteredParticipants(hackathon.id, activeParticipantTab).map((participant: Participant) => (
                                          <tr key={participant.id}>
                                            <td className="px-4 py-3 whitespace-nowrap">{participant.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{participant.email}</td>
                                            <td className="px-4 py-3">
                                              <div className="flex flex-wrap gap-1">
                                                {participant.skills?.map((skill, idx) => (
                                                  <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                    {skill}
                                                  </span>
                                                ))}
                                              </div>
                                            </td>
                                            <td className="px-4 py-3">
                                              {participant.teamName ? (
                                                <div>
                                                  <div className="font-medium">{participant.teamName}</div>
                                                  {participant.teammates && participant.teammates.length > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                      {participant.teammates.join(', ')}
                                                    </div>
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="text-gray-500">Individual</span>
                                              )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                                participant.status === 'approved'
                                                  ? 'bg-green-100 text-green-800'
                                                  : participant.status === 'rejected'
                                                  ? 'bg-red-100 text-red-800'
                                                  : 'bg-yellow-100 text-yellow-800'
                                              }`}>
                                                {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              {participant.status === 'pending' && (
                                                <div className="flex space-x-2">
                                                  <button
                                                    onClick={() => handleParticipantAction(hackathon.id, participant.id, 'approved')}
                                                    className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                                    title="Approve"
                                                  >
                                                    <FaCheckCircle className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleParticipantAction(hackathon.id, participant.id, 'rejected')}
                                                    className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                                                    title="Reject"
                                                  >
                                                    <FaTimesCircle className="w-4 h-4" />
                                                  </button>
                                                </div>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-gray-500">
                                    No participants found in this category.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't created any hackathons yet.</p>
                    <Link
                      to="/create-hackathon"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                    >
                      <FaPlus /> Create Your First Hackathon
                    </Link>
                  </div>
                )
              ) : (
                myParticipations.length > 0 ? (
                  <div className="space-y-6">
                    {myParticipations.map(({ hackathon, participant }) => (
                      <div key={`${hackathon.id}-${participant.id}`} className="border rounded-lg overflow-hidden shadow-sm">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4 h-48 md:h-auto">
                            <img
                              src={hackathon.image || 'https://via.placeholder.com/300x200?text=Hackathon'}
                              alt={hackathon.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <h3 className="text-xl font-bold mb-2">{hackathon.title}</h3>
                                <p className="text-gray-600 mb-4">
                                  {hackathon.description && hackathon.description.substring(0, 150)}...
                                </p>
                                <div className="flex items-center text-gray-500 mb-2">
                                  <FaCalendarAlt className="mr-2" />
                                  {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                                </div>
                                <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {hackathon.category}
                                </div>
                                
                                {/* Participation status */}
                                <div className="mt-2">
                                  <span className="text-sm font-medium text-gray-700">Status: </span>
                                  <span className={`text-sm ml-1 ${
                                    participant.status === 'approved' 
                                      ? 'text-green-600' 
                                      : participant.status === 'rejected'
                                        ? 'text-red-600'
                                        : 'text-yellow-600'
                                  }`}>
                                    {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                                  </span>
                                </div>
                                
                                {/* Payment status if applicable */}
                                {participant.paymentStatus && participant.paymentStatus !== 'not_required' && (
                                  <div className="mt-1">
                                    <span className="text-sm font-medium text-gray-700">Payment: </span>
                                    <span className={`text-sm ml-1 ${
                                      participant.paymentStatus === 'completed' 
                                        ? 'text-green-600' 
                                        : participant.paymentStatus === 'failed'
                                          ? 'text-red-600'
                                          : 'text-yellow-600'
                                    }`}>
                                      {participant.paymentStatus.charAt(0).toUpperCase() + participant.paymentStatus.slice(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Actions */}
                              <div className="mt-4 md:mt-0 flex flex-col items-end">
                                <Link
                                  to={`/hackathons/${hackathon.id}`}
                                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-2"
                                >
                                  View Details
                                </Link>
                                
                                <button
                                  onClick={() => handleWithdraw(hackathon.id, participant.id)}
                                  disabled={isWithdrawing === hackathon.id}
                                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                                >
                                  {isWithdrawing === hackathon.id ? (
                                    <span>Withdrawing...</span>
                                  ) : (
                                    <>
                                      <FaSignOutAlt className="mr-2" />
                                      Withdraw
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't registered for any hackathons yet.</p>
                    <Link
                      to="/hackathons"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                    >
                      Browse Hackathons
                    </Link>
                  </div>
                )
              )}
            </div>
          )}
          
          {activeTab === 'all-hackathons' && user.role === 'admin' && (
            <div>
              <h2 className="text-xl font-bold mb-4">All Hackathons (Admin View)</h2>
              {allHackathons && allHackathons.length > 0 ? (
                <div className="space-y-6">
                  {allHackathons.map(hackathon => (
                    <div key={hackathon.id} className="border rounded-lg overflow-hidden shadow-sm">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 h-48 md:h-auto">
                          <img
                            src={hackathon.image || 'https://via.placeholder.com/300x200?text=Hackathon'}
                            alt={hackathon.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div>
                              <h3 className="text-xl font-bold mb-2">{hackathon.title}</h3>
                              <p className="text-gray-600 mb-4">
                                {hackathon.description && hackathon.description.substring(0, 150)}...
                              </p>
                              <div className="flex items-center text-gray-500 mb-2">
                                <FaCalendarAlt className="mr-2" />
                                {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                              </div>
                              <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {hackathon.category}
                              </div>
                              <div className="mt-2 text-gray-500">
                                Creator ID: {hackathon.creatorId}
                              </div>
                              {hackathon.participants && hackathon.participants.length > 0 && (
                                <div className="mt-2 flex items-center text-gray-500">
                                  <FaUsers className="mr-2" /> 
                                  {hackathon.participants.length} Participants
                                </div>
                              )}
                            </div>
                            <div className="flex mt-4 md:mt-0 space-x-2">
                              <Link
                                to={`/hackathon/${hackathon.id}`}
                                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => handleDeleteAnyHackathon(hackathon.id)}
                                disabled={isDeleting === hackathon.id}
                                className={`flex items-center gap-1 px-3 py-2 rounded ${
                                  isDeleting === hackathon.id
                                    ? 'bg-red-200 text-red-700 opacity-75'
                                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                                }`}
                              >
                                <FaTrash /> {isDeleting === hackathon.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Participants section for admin view */}
                      {hackathon.participants && hackathon.participants.length > 0 && (
                        <div className="border-t border-gray-200 p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-medium">Participants</h4>
                            <button
                              onClick={() => setSelectedHackathon(selectedHackathon === hackathon.id ? null : hackathon.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {selectedHackathon === hackathon.id ? 'Hide Participants' : 'Show Participants'}
                            </button>
                          </div>
                          
                          {selectedHackathon === hackathon.id && (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {hackathon.participants.map((participant: Participant) => (
                                    <tr key={participant.id}>
                                      <td className="px-4 py-3 whitespace-nowrap">{participant.name}</td>
                                      <td className="px-4 py-3 whitespace-nowrap">{participant.email}</td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                          participant.status === 'approved'
                                            ? 'bg-green-100 text-green-800'
                                            : participant.status === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No hackathons found in the system.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'account' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user.name || 'User'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email || 'No email provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user.role || 'Participant'}</p>
                </div>
              </div>
              
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Privacy and Security</h3>
                <button className="text-blue-600 hover:text-blue-800 transition">
                  Change Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 