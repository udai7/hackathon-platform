import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { useHackathons } from '../context/HackathonContext';
import HackathonCard from '../components/HackathonCard';

// Available categories for filtering
const categories = [
  'All',
  'Artificial Intelligence',
  'Blockchain',
  'Web Development',
  'Mobile',
  'Data Science',
  'Cybersecurity',
  'Gaming',
  'IoT',
  'Healthcare',
  'Sustainability',
  'Education',
  'Open Innovation'
];

const Hackathons = () => {
  const { allHackathons } = useHackathons();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredHackathons, setFilteredHackathons] = useState(allHackathons);
  
  useEffect(() => {
    let result = allHackathons;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(hackathon => 
        hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(hackathon => 
        hackathon.category === selectedCategory
      );
    }
    
    setFilteredHackathons(result);
  }, [searchTerm, selectedCategory, allHackathons]);
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Hackathons</h1>
        <p className="text-gray-600 text-center">Discover exciting hackathons and showcase your skills</p>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search hackathons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="md:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={resetFilters}
            className="md:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaTimes className="mr-2" /> Clear Filters
          </button>
        </div>
      </div>
      
      {/* Results Summary */}
      {(searchTerm || selectedCategory !== 'All') && (
        <div className="mb-6">
          <p className="text-gray-600">
            Found {filteredHackathons.length} hackathon
            {filteredHackathons.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>
      )}
      
      {/* Hackathons Grid */}
      {filteredHackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => (
            <Link key={hackathon.id} to={`/hackathon/${hackathon.id}`}>
              <HackathonCard hackathon={hackathon} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-900">No hackathons found</h3>
          <p className="mt-2 text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          {(searchTerm || selectedCategory !== 'All') && (
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Hackathons;