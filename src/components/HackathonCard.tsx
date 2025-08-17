import { FC } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import { Hackathon } from "../types";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
// Format date to display in a readable format
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
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
    participants = [],
  } = hackathon;

  return (
    <div className="h-full">
      <Card className="overflow-hidden bg-gradient-to-b from-gray-800/90 to-gray-900/90 border border-gray-700/50 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 h-full">
        {/* Header Image Area */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={image || "/default-hackathon.jpg"}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Top Right Category Tag */}
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
              {category}
            </span>
          </div>
        </div>

        <CardContent className="pt-6 pb-4 px-4">
          {/* Title and Description */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
              {title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
          </div>

          {/* Participants Count */}
          <div className="flex items-center justify-center text-blue-400 text-sm mb-2">
            <FaUsers className="mr-1" />
            {participants.length} Participant
            {participants.length !== 1 ? "s" : ""}
          </div>

          {/* Date */}
          <div className="flex items-center justify-center text-gray-400 text-sm mb-3">
            <FaCalendarAlt className="mr-1" />
            {formatDate(startDate)} - {formatDate(endDate)}
          </div>

          {/* Location */}
          {location && (
            <div className="flex items-center justify-center text-gray-400 text-sm mb-4">
              <FaMapMarkerAlt className="mr-1" />
              {location}
            </div>
          )}

          {/* Team Size Tag */}
          {teamSize && Number(teamSize) > 1 && (
            <div className="flex justify-center mb-4">
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">
                Teams of {teamSize}
              </span>
            </div>
          )}

          {/* View Details Button */}
          <Button
            variant="outline"
            className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HackathonCard;
