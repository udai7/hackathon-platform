import { FC } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import { Hackathon } from "../types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import FloatingCard3D from "./FloatingCard3D";

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
      <Card className="glass-dark overflow-hidden h-full group border-2 border-white/10 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-400/20 transition-all duration-300">
        {/* Card Image */}
        <div className="h-48 overflow-hidden relative">
          <img
            src={image || "/default-hackathon.jpg"}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 m-3">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              {category}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center space-x-2 text-white/80 text-xs">
              <FaUsers className="text-blue-400" />
              <span>{participants.length} Participants</span>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <CardHeader className="pb-3">
          <CardTitle className="text-white line-clamp-2">{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
            {description}
          </p>

          {/* Card Meta Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-300">
              <FaCalendarAlt className="text-blue-400 mr-2 flex-shrink-0" />
              <span className="truncate">
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
            </div>

            {location && (
              <div className="flex items-center text-gray-300">
                <FaMapMarkerAlt className="text-purple-400 mr-2 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}

            {teamSize && Number(teamSize) > 1 && (
              <div className="flex items-center text-gray-300">
                <FaUsers className="text-green-400 mr-2 flex-shrink-0" />
                <span>Teams of {teamSize}</span>
              </div>
            )}
          </div>
        </CardContent>

        {/* Action Button */}
        <CardFooter className="pt-0">
          <Button variant="cyber" className="w-full">
            View Details
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HackathonCard;
