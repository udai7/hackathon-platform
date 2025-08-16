import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ParticipantProfile } from "../types";
import profileService from "../services/profileService";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  FaUser,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaGlobe,
  FaPlus,
  FaTrash,
  FaSave,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

interface CreateProfileProps {
  onProfileSaved?: (profile: ParticipantProfile) => void;
}

const CreateProfile: React.FC<CreateProfileProps> = ({ onProfileSaved }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<ParticipantProfile>>({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
    title: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    twitter: "",
    skills: [],
    experience: "",
    education: {
      degree: "",
      institution: "",
      graduationYear: "",
    },
    achievements: [],
    projects: [],
    isPublic: true,
  });

  const [newSkill, setNewSkill] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: [],
    githubUrl: "",
    liveUrl: "",
    imageUrl: "",
  });
  const [newProjectTech, setNewProjectTech] = useState("");

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const existingProfile = await profileService.getProfile(user.id);
      if (existingProfile) {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const profileData = {
        ...profile,
        userId: user.id,
        updatedAt: new Date().toISOString(),
      };

      if (!profile.id) {
        profileData.createdAt = new Date().toISOString();
      }

      const savedProfile = await profileService.saveProfile(profileData);
      setProfile(savedProfile);
      onProfileSaved?.(savedProfile);

      // Show success message
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills?.filter((s) => s !== skill) || [],
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setProfile((prev) => ({
        ...prev,
        achievements: [...(prev.achievements || []), newAchievement.trim()],
      }));
      setNewAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      achievements: prev.achievements?.filter((_, i) => i !== index) || [],
    }));
  };

  const addProjectTech = () => {
    if (
      newProjectTech.trim() &&
      !newProject.technologies.includes(newProjectTech.trim())
    ) {
      setNewProject((prev) => ({
        ...prev,
        technologies: [...prev.technologies, newProjectTech.trim()],
      }));
      setNewProjectTech("");
    }
  };

  const removeProjectTech = (tech: string) => {
    setNewProject((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  const addProject = () => {
    if (newProject.title.trim() && newProject.description.trim()) {
      setProfile((prev) => ({
        ...prev,
        projects: [...(prev.projects || []), { ...newProject }],
      }));
      setNewProject({
        title: "",
        description: "",
        technologies: [],
        githubUrl: "",
        liveUrl: "",
        imageUrl: "",
      });
    }
  };

  const removeProject = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects?.filter((_, i) => i !== index) || [],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-dark">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FaUser className="mr-2 text-blue-400" />
            Create Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={profile.name || ""}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Professional Title
              </label>
              <input
                type="text"
                value={profile.title || ""}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Full Stack Developer, AI/ML Engineer"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={profile.bio || ""}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Tell us about yourself, your interests, and what drives you as a developer..."
              rows={4}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={profile.location || ""}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="City, Country"
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Experience Level
              </label>
              <select
                value={profile.experience || ""}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    experience: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select experience level</option>
                <option value="Student">Student</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-2 years">1-2 years</option>
                <option value="2-3 years">2-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaGlobe className="inline mr-1" /> Website
                </label>
                <input
                  type="url"
                  value={profile.website || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, website: e.target.value }))
                  }
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaGithub className="inline mr-1" /> GitHub
                </label>
                <input
                  type="text"
                  value={profile.github || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, github: e.target.value }))
                  }
                  placeholder="github.com/username"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaLinkedin className="inline mr-1" /> LinkedIn
                </label>
                <input
                  type="text"
                  value={profile.linkedin || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      linkedin: e.target.value,
                    }))
                  }
                  placeholder="linkedin.com/in/username"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaTwitter className="inline mr-1" /> Twitter
                </label>
                <input
                  type="text"
                  value={profile.twitter || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, twitter: e.target.value }))
                  }
                  placeholder="twitter.com/username"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Skills</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add a skill (e.g., React, Python, Machine Learning)"
                className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={addSkill} variant="glass" size="sm">
                <FaPlus />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-blue-300 hover:text-red-300"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Degree
                </label>
                <input
                  type="text"
                  value={profile.education?.degree || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      education: { ...prev.education, degree: e.target.value },
                    }))
                  }
                  placeholder="e.g., Bachelor's in Computer Science"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Institution
                </label>
                <input
                  type="text"
                  value={profile.education?.institution || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      education: {
                        ...prev.education,
                        institution: e.target.value,
                      },
                    }))
                  }
                  placeholder="University/College name"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Graduation Year
                </label>
                <input
                  type="text"
                  value={profile.education?.graduationYear || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      education: {
                        ...prev.education,
                        graduationYear: e.target.value,
                      },
                    }))
                  }
                  placeholder="2024"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Achievements</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addAchievement()}
                placeholder="Add an achievement (e.g., Won XYZ Hackathon 2024)"
                className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={addAchievement} variant="glass" size="sm">
                <FaPlus />
              </Button>
            </div>
            <div className="space-y-2">
              {profile.achievements?.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                >
                  <span className="text-gray-300">{achievement}</span>
                  <button
                    onClick={() => removeAchievement(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
            <div>
              <h3 className="text-white font-medium">Profile Visibility</h3>
              <p className="text-gray-400 text-sm">
                Make your profile visible to other participants
              </p>
            </div>
            <button
              onClick={() =>
                setProfile((prev) => ({ ...prev, isPublic: !prev.isPublic }))
              }
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                profile.isPublic
                  ? "bg-green-500/20 text-green-400"
                  : "bg-gray-600/20 text-gray-400"
              }`}
            >
              {profile.isPublic ? (
                <FaEye className="mr-2" />
              ) : (
                <FaEyeSlash className="mr-2" />
              )}
              {profile.isPublic ? "Public" : "Private"}
            </button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || !profile.name?.trim()}
              variant="cyber"
              className="px-8"
            >
              {saving ? (
                <div className="loading-spinner w-4 h-4 mr-2" />
              ) : (
                <FaSave className="mr-2" />
              )}
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProfile;
