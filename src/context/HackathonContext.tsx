import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Hackathon } from '../types';
import * as hackathonService from '../services/hackathonService';

interface HackathonContextType {
  allHackathons: Hackathon[];
  userHackathons: Hackathon[];
  addHackathon: (hackathon: Hackathon) => Promise<Hackathon>;
  updateHackathon: (hackathon: Hackathon) => Promise<void>;
  deleteHackathon: (id: string) => Promise<void>;
  featuredHackathons: Hackathon[];
  isLoading: boolean;
  error: string | null;
}

const HackathonContext = createContext<HackathonContextType | undefined>(undefined);

interface HackathonProviderProps {
  children: ReactNode;
}

export const HackathonProvider = ({ children }: HackathonProviderProps) => {
  const { user } = useAuth();
  const [allHackathons, setAllHackathons] = useState<Hackathon[]>([]);
  const [userHackathons, setUserHackathons] = useState<Hackathon[]>([]);
  const [featuredHackathons, setFeaturedHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load hackathons from API
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setIsLoading(true);
        const hackathons = await hackathonService.getAllHackathons();
        setAllHackathons(hackathons);
        
        // Load featured hackathons
        const featured = await hackathonService.getFeaturedHackathons();
        setFeaturedHackathons(featured);
        
        setError(null);
      } catch (error) {
        console.error('Error loading hackathons:', error);
        setError('Failed to load hackathons');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  // Filter hackathons by current user
  useEffect(() => {
    const fetchUserHackathons = async () => {
      if (user) {
        try {
          const userHackathons = await hackathonService.getHackathonsByCreator(user.id);
          setUserHackathons(userHackathons);
        } catch (error) {
          console.error('Error fetching user hackathons:', error);
        }
      } else {
        setUserHackathons([]);
      }
    };

    fetchUserHackathons();
  }, [user, allHackathons]);

  // Add a new hackathon
  const addHackathon = async (hackathon: Hackathon) => {
    try {
      // First try to create the hackathon through the API
      const createdHackathon = await hackathonService.createHackathon(hackathon);
      
      // If successful, update the local state
      setAllHackathons(prevHackathons => [...prevHackathons, createdHackathon]);
      
      // Update featured hackathons if needed
      if (createdHackathon.featured) {
        const featured = await hackathonService.getFeaturedHackathons();
        setFeaturedHackathons(featured);
      }
      
      // Clear any previous errors
      setError(null);
      return createdHackathon;
    } catch (error: any) {
      console.error('Error adding hackathon:', error);
      
      // Set error message in context for displaying to user
      let errorMessage = 'Failed to create hackathon';
      
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes('Network Error') || 
            error.message.includes('connect') || 
            error.message.includes('timeout') ||
            error.message.includes('server')) {
          errorMessage = `Network error: ${error.message}`;
        } else {
          errorMessage = error.message;
        }
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  // Update an existing hackathon
  const updateHackathon = async (hackathon: Hackathon): Promise<void> => {
    try {
      const updatedHackathon = await hackathonService.updateHackathon(hackathon);
      if (updatedHackathon) {
        setAllHackathons(prevHackathons => 
          prevHackathons.map(h => h.id === updatedHackathon.id ? updatedHackathon : h)
        );
        
        // Update featured hackathons
        const featured = await hackathonService.getFeaturedHackathons();
        setFeaturedHackathons(featured);
        
        // Clear any previous errors
        setError(null);
      }
    } catch (error: any) {
      console.error('Error updating hackathon:', error);
      
      // Set error message in context for displaying to user
      let errorMessage = 'Failed to update hackathon';
      
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes('Network Error') || 
            error.message.includes('connect') || 
            error.message.includes('timeout') ||
            error.message.includes('server')) {
          errorMessage = `Network error: ${error.message}`;
        } else {
          errorMessage = error.message;
        }
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  // Delete a hackathon
  const deleteHackathon = async (id: string) => {
    try {
      const success = await hackathonService.deleteHackathon(id);
      if (success) {
        setAllHackathons(prevHackathons => prevHackathons.filter(h => h.id !== id));
        
        // Update featured hackathons
        const featured = await hackathonService.getFeaturedHackathons();
        setFeaturedHackathons(featured);
      }
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      throw error;
    }
  };

  const contextValue: HackathonContextType = {
    allHackathons,
    userHackathons,
    addHackathon,
    updateHackathon,
    deleteHackathon,
    featuredHackathons,
    isLoading,
    error
  };

  return (
    <HackathonContext.Provider value={contextValue}>
      {children}
    </HackathonContext.Provider>
  );
};

export function useHackathons(): HackathonContextType {
  const context = useContext(HackathonContext);
  if (context === undefined) {
    throw new Error('useHackathons must be used within a HackathonProvider');
  }
  return context;
}; 