import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaGlobe,
  FaTrophy,
  FaMapMarkerAlt,
  FaCode,
  FaSearch,
  FaFilter,
  FaStar,
} from "react-icons/fa";
import { ParticipantProfile } from "../types";
import profileService from "../services/profileService";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const ExploreParticipants = () => {
  const [profiles, setProfiles] = useState<ParticipantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [sortBy, setSortBy] = useState<"wins" | "participations" | "name">(
    "wins"
  );

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const allProfiles = await profileService.getAllProfiles();
      setProfiles(allProfiles);
    } catch (error) {
      console.error("Error loading profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedProfiles = profiles
    .filter((profile) => {
      const matchesSearch =
        profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSkill =
        !skillFilter ||
        profile.skills.some((skill) =>
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        );

      const matchesExperience =
        !experienceFilter || profile.experience === experienceFilter;

      return matchesSearch && matchesSkill && matchesExperience;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "wins":
          return b.hackathonsWon - a.hackathonsWon;
        case "participations":
          return b.totalParticipations - a.totalParticipations;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const allSkills = Array.from(
    new Set(profiles.flatMap((p) => p.skills))
  ).sort();
  const allExperiences = Array.from(
    new Set(profiles.map((p) => p.experience).filter(Boolean))
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading participants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Explore Participants
          </h1>
          <p className="text-gray-400 text-lg">
            Discover talented developers from our hackathon community
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="glass-dark mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaSearch className="inline mr-1" /> Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, title, or bio..."
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaCode className="inline mr-1" /> Skill
                </label>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Skills</option>
                  {allSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaUser className="inline mr-1" /> Experience
                </label>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  {allExperiences.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaFilter className="inline mr-1" /> Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "wins" | "participations" | "name"
                    )
                  }
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="wins">Most Wins</option>
                  <option value="participations">Most Participations</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredAndSortedProfiles.length} of {profiles.length}{" "}
            participants
          </p>
        </div>

        {/* Participants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProfiles.map((profile) => (
            <Card
              key={profile.id}
              className="overflow-hidden bg-gradient-to-b from-gray-800/90 to-gray-900/90 border border-gray-700/50 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
            >
              {/* Header Area with Large Avatar */}
              <div className="relative h-48 overflow-hidden">
                {/* Avatar as background image */}
                <div className="w-full h-full bg-gradient-to-br from-purple-600/30 via-blue-600/30 to-cyan-600/30 relative">
                  {profile.avatar ? (
                    <>
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <>
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                        <FaUser className="w-20 h-20 text-gray-400" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </>
                  )}
                </div>

                {/* Top Right Category Tag */}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                    {profile.title || "Developer"}
                  </span>
                </div>
              </div>

              <CardContent className="pt-6 pb-4 px-4">
                {/* Title and Subtitle */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {profile.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {profile.bio
                      ? profile.bio.slice(0, 50) +
                        (profile.bio.length > 50 ? "..." : "")
                      : "No bio available"}
                  </p>
                </div>

                {/* Stats Row - Similar to participants count */}
                <div className="flex items-center justify-center text-blue-400 text-sm mb-2">
                  <FaTrophy className="mr-1" />
                  {profile.hackathonsWon} Win
                  {profile.hackathonsWon !== 1 ? "s" : ""} •{" "}
                  {profile.totalParticipations} Participation
                  {profile.totalParticipations !== 1 ? "s" : ""}
                </div>

                {/* Location - Similar to date */}
                {profile.location && (
                  <div className="flex items-center justify-center text-gray-400 text-sm mb-3">
                    <FaMapMarkerAlt className="mr-1" />
                    {profile.location}
                  </div>
                )}

                {/* Skills - Similar to category tags */}
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                  {profile.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                  {profile.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded border border-gray-600/30">
                      +{profile.skills.length - 3}
                    </span>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-3 mb-4">
                  {profile.github && (
                    <a
                      href={
                        profile.github.startsWith("http")
                          ? profile.github
                          : `https://${profile.github}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <FaGithub className="w-4 h-4" />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={
                        profile.linkedin.startsWith("http")
                          ? profile.linkedin
                          : `https://${profile.linkedin}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <FaLinkedin className="w-4 h-4" />
                    </a>
                  )}
                  {profile.twitter && (
                    <a
                      href={
                        profile.twitter.startsWith("http")
                          ? profile.twitter
                          : `https://${profile.twitter}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <FaTwitter className="w-4 h-4" />
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={
                        profile.website.startsWith("http")
                          ? profile.website
                          : `https://${profile.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-green-400 transition-colors"
                    >
                      <FaGlobe className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* View Profile Button - Same style as hackathon card */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  <Link to={`/participant/${profile.userId}`}>
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedProfiles.length === 0 && (
          <Card className="glass-dark text-center py-16">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <FaUser className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  No Participants Found
                </h3>
                <p className="text-gray-400 mb-8">
                  {profiles.length === 0
                    ? "No participants have created profiles yet."
                    : "Try adjusting your search filters to find more participants."}
                </p>
                {profiles.length === 0 && (
                  <Button asChild variant="cyber">
                    <Link to="/dashboard">
                      <FaUser className="mr-2" />
                      Create Your Profile
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExploreParticipants;
