import { FC } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { Hackathon } from '../types';

// Format date to display in a readable format
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

interface HackathonCardProps {
  hackathon: Hackathon;
}

const HackathonCard: FC<HackathonCardProps> = ({ hackathon }) => {
  const {
    title,
    description,
    startDate,
    endDate,
    location,
    image,
    category,
    teamSize,
    participants = []
  } = hackathon;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
      {/* Card Image */}
      <div className="h-48 overflow-hidden relative">
        <img 
          src={image || '/default-hackathon.jpg'} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 m-2 rounded-full text-xs font-semibold">
          {category}
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-5">
        <h3 className="font-bold text-xl mb-2 text-gray-800 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{description}</p>
        
        {/* Card Meta Info */}
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center">
            <FaCalendarAlt className="text-indigo-500 mr-2" />
            <span>
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
          
          {location && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-indigo-500 mr-2" />
              <span>{location}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <FaUsers className="text-indigo-500 mr-2" />
            <span>
              {participants.length} Participants
              {teamSize && Number(teamSize) > 1 && ` • Teams of ${teamSize}`}
            </span>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors duration-300">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default HackathonCard; 