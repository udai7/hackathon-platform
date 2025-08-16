import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaUser,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaGlobe,
  FaTrophy,
  FaMapMarkerAlt,
  FaCode,
  FaGraduationCap,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaArrowLeft,
  FaStar,
  FaAward,
} from "react-icons/fa";
import { ParticipantProfile } from "../types";
import profileService from "../services/profileService";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const ParticipantProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;

    try {
      const profileData = await profileService.getProfile(userId);
      if (profileData && profileData.isPublic) {
        setProfile(profileData);
      } else {
        setError("Profile not found or is private");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center">
            <FaUser className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Profile Not Found
          </h2>
          <p className="text-gray-400 mb-8">{error}</p>
          <Button asChild variant="cyber">
            <Link to="/participants">
              <FaArrowLeft className="mr-2" />
              Back to Participants
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="glass">
            <Link to="/participants">
              <FaArrowLeft className="mr-2" />
              Back to Participants
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <Card className="glass-dark">
              <CardContent className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {profile.name}
                </h1>
                {profile.title && (
                  <p className="text-blue-400 text-lg mb-3">{profile.title}</p>
                )}
                {profile.location && (
                  <p className="text-gray-400 flex items-center justify-center mb-4">
                    <FaMapMarkerAlt className="mr-2" />
                    {profile.location}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <FaTrophy className="text-yellow-400 mr-1" />
                      <span className="text-2xl font-bold text-white">
                        {profile.hackathonsWon}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">Hackathons Won</p>
                  </div>
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <FaCode className="text-blue-400 mr-1" />
                      <span className="text-2xl font-bold text-white">
                        {profile.totalParticipations}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Total Participations
                    </p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-4">
                  {profile.github && (
                    <a
                      href={
                        profile.github.startsWith("http")
                          ? profile.github
                          : `https://${profile.github}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-800/30 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <FaGithub className="w-5 h-5" />
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
                      className="p-3 bg-gray-800/30 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <FaLinkedin className="w-5 h-5" />
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
                      className="p-3 bg-gray-800/30 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <FaTwitter className="w-5 h-5" />
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
                      className="p-3 bg-gray-800/30 rounded-lg text-gray-400 hover:text-green-400 transition-colors"
                    >
                      <FaGlobe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Experience & Education */}
            <Card className="glass-dark">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FaGraduationCap className="mr-2 text-purple-400" />
                  Background
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.experience && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-1">
                      Experience Level
                    </h4>
                    <p className="text-white">{profile.experience}</p>
                  </div>
                )}

                {profile.education &&
                  (profile.education.degree ||
                    profile.education.institution) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-1">
                        Education
                      </h4>
                      <div className="text-white">
                        {profile.education.degree && (
                          <p>{profile.education.degree}</p>
                        )}
                        {profile.education.institution && (
                          <p className="text-gray-400">
                            {profile.education.institution}
                          </p>
                        )}
                        {profile.education.graduationYear && (
                          <p className="text-gray-400">
                            {profile.education.graduationYear}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <Card className="glass-dark">
                <CardHeader>
                  <CardTitle className="text-white">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            <Card className="glass-dark">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FaCode className="mr-2 text-blue-400" />
                  Skills & Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            {profile.achievements && profile.achievements.length > 0 && (
              <Card className="glass-dark">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FaAward className="mr-2 text-yellow-400" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-start p-3 bg-gray-800/30 rounded-lg"
                      >
                        <FaStar className="text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                        <p className="text-gray-300">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            {profile.projects && profile.projects.length > 0 && (
              <Card className="glass-dark">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FaCode className="mr-2 text-green-400" />
                    Featured Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {profile.projects.map((project, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-semibold text-white">
                            {project.title}
                          </h4>
                          <div className="flex space-x-2">
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <FaGithub className="w-5 h-5" />
                              </a>
                            )}
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-400 transition-colors"
                              >
                                <FaExternalLinkAlt className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-300 mb-3">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Stats */}
            <Card className="glass-dark">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-400" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Member since:</span>
                    <p className="text-white">
                      {new Date(profile.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Last updated:</span>
                    <p className="text-white">
                      {new Date(profile.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantProfilePage;
