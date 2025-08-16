import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaUsers,
  FaTrophy,
  FaCode,
  FaChartLine,
  FaBell,
  FaEye,
  FaMapMarkerAlt,
  FaFire,
  FaRocket,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useHackathons } from "../context/HackathonContext";
import { Participant, Hackathon } from "../types";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import CreateProfile from "../components/CreateProfile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userHackathons, deleteHackathon, allHackathons } = useHackathons();

  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [myParticipations, setMyParticipations] = useState<
    { hackathon: Hackathon; participant: Participant }[]
  >([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Get all hackathons where the user is a participant
  useEffect(() => {
    if (user && user.role === "participant" && allHackathons.length > 0) {
      const participations = allHackathons
        .filter((hackathon) =>
          hackathon.participants?.some(
            (participant) => participant.userId === user.id
          )
        )
        .map((hackathon) => {
          const participant = hackathon.participants?.find(
            (p) => p.userId === user.id
          );
          if (participant) {
            return { hackathon, participant };
          }
          return null;
        })
        .filter((item) => item !== null) as {
        hackathon: Hackathon;
        participant: Participant;
      }[];

      setMyParticipations(participations);
    }
  }, [user, allHackathons]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDeleteHackathon = async (hackathonId: string) => {
    if (window.confirm("Are you sure you want to delete this hackathon?")) {
      setIsDeleting(hackathonId);
      try {
        await deleteHackathon(hackathonId);
      } catch (error) {
        console.error("Error deleting hackathon:", error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleEditHackathon = (hackathonId: string) => {
    navigate(`/create-hackathon/${hackathonId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate number of hackathons won by participant
  const wonCount =
    user.role === "participant"
      ? myParticipations.filter(
          (p) =>
            p.participant.projectSubmission &&
            p.participant.projectSubmission.winner &&
            ["1st", "2nd", "3rd"].includes(
              p.participant.projectSubmission.winner.position
            )
        ).length
      : 0;

  const stats = {
    totalHackathons:
      user.role === "host" ? userHackathons.length : myParticipations.length,
    activeHackathons:
      user.role === "host"
        ? userHackathons.filter((h) => new Date(h.endDate) > new Date()).length
        : myParticipations.filter(
            (p) => new Date(p.hackathon.endDate) > new Date()
          ).length,
    totalParticipants:
      user.role === "host"
        ? userHackathons.reduce(
            (sum, h) => sum + (h.participants?.length || 0),
            0
          )
        : 0,
    completedHackathons:
      user.role === "host"
        ? userHackathons.filter((h) => new Date(h.endDate) < new Date()).length
        : myParticipations.filter(
            (p) => new Date(p.hackathon.endDate) < new Date()
          ).length,
    wonHackathons: wonCount,
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-400 text-lg">
            {user.role === "host"
              ? "Manage your hackathons and track participant engagement"
              : "Track your hackathon participations and submissions"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-3d glass-dark">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <FaRocket className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">
                    {user.role === "host"
                      ? "Total Hackathons"
                      : "Participations"}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalHackathons}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-3d glass-dark">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500/20">
                  <FaFire className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.activeHackathons}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {user.role === "host" && (
            <Card className="card-3d glass-dark">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-500/20">
                    <FaUsers className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">
                      Total Participants
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalParticipants}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="card-3d glass-dark">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-500/20">
                  <FaTrophy className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.completedHackathons}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Won Card for participants */}
          {user.role === "participant" && (
            <Card className="card-3d glass-dark">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-pink-500/20">
                    <FaTrophy className="h-6 w-6 text-pink-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Won</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.wonHackathons}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <FaChartLine className="inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("hackathons")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "hackathons"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <FaCode className="inline mr-2" />
              {user.role === "host" ? "My Hackathons" : "My Participations"}
            </button>
            {user.role === "participant" && (
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === "profile"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <FaUser className="inline mr-2" />
                Create Profile
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {user.role === "host" ? (
              <Card className="glass-dark">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FaPlus className="mr-2 text-green-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild variant="cyber">
                      <Link to="/create-hackathon">
                        <FaPlus className="mr-2" />
                        Create New Hackathon
                      </Link>
                    </Button>
                    <Button asChild variant="glass">
                      <Link to="/hackathons">
                        <FaEye className="mr-2" />
                        Browse All Hackathons
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-dark">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FaRocket className="mr-2 text-blue-400" />
                    Discover New Hackathons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    Ready to showcase your skills? Join exciting hackathons and
                    compete with developers worldwide.
                  </p>
                  <Button asChild variant="cyber">
                    <Link to="/hackathons">
                      <FaEye className="mr-2" />
                      Explore Hackathons
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="glass-dark">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FaBell className="mr-2 text-yellow-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.role === "host"
                    ? userHackathons.slice(0, 3).map((hackathon) => (
                        <div
                          key={hackathon.id}
                          className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
                        >
                          <div>
                            <h4 className="text-white font-medium">
                              {hackathon.title}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {hackathon.participants?.length || 0} participants
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleEditHackathon(hackathon.id)}
                              variant="glass"
                              size="sm"
                            >
                              <FaEdit className="mr-1" />
                              Edit
                            </Button>
                            <Button asChild variant="glass" size="sm">
                              <Link to={`/hackathon/${hackathon.id}`}>
                                <FaEye className="mr-1" />
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    : myParticipations
                        .slice(0, 3)
                        .map(({ hackathon, participant }) => (
                          <div
                            key={hackathon.id}
                            className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
                          >
                            <div>
                              <h4 className="text-white font-medium">
                                {hackathon.title}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                Status:{" "}
                                <span className="capitalize">
                                  {participant.status}
                                </span>
                                {participant.projectSubmission?.winner && (
                                  <>
                                    <span className="ml-3 inline-flex items-center px-2 py-1 bg-green-600 text-black text-xs font-semibold rounded">
                                      {
                                        participant.projectSubmission.winner
                                          .position
                                      }{" "}
                                      Winner
                                    </span>
                                    {participant.projectSubmission.winner
                                      .description && (
                                      <div className="mt-1 text-xs text-gray-300">
                                        {
                                          participant.projectSubmission.winner
                                            .description
                                        }
                                      </div>
                                    )}
                                  </>
                                )}
                              </p>
                            </div>
                            <Button asChild variant="glass" size="sm">
                              <Link to={`/hackathon/${hackathon.id}`}>
                                <FaEye className="mr-1" />
                                View
                              </Link>
                            </Button>
                          </div>
                        ))}
                  {((user.role === "host" && userHackathons.length === 0) ||
                    (user.role === "participant" &&
                      myParticipations.length === 0)) && (
                    <p className="text-gray-400 text-center py-8">
                      {user.role === "host"
                        ? "No hackathons created yet. Create your first hackathon to get started!"
                        : "No participations yet. Join a hackathon to get started!"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "hackathons" && (
          <div className="space-y-6">
            {user.role === "host" ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    My Hackathons
                  </h2>
                  <Button asChild variant="cyber">
                    <Link to="/create-hackathon">
                      <FaPlus className="mr-2" />
                      Create New
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-6">
                  {userHackathons.map((hackathon) => (
                    <Card key={hackathon.id} className="card-3d glass-dark">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">
                              {hackathon.title}
                            </h3>
                            <p className="text-gray-400 mb-4 line-clamp-2">
                              {hackathon.description}
                            </p>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                              <div className="flex items-center">
                                <FaCalendarAlt className="mr-1 text-blue-400" />
                                {formatDate(hackathon.startDate)} -{" "}
                                {formatDate(hackathon.endDate)}
                              </div>
                              <div className="flex items-center">
                                <FaUsers className="mr-1 text-green-400" />
                                {hackathon.participants?.length || 0}{" "}
                                participants
                              </div>
                              {hackathon.location && (
                                <div className="flex items-center">
                                  <FaMapMarkerAlt className="mr-1 text-purple-400" />
                                  {hackathon.location}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <Button
                              onClick={() => handleEditHackathon(hackathon.id)}
                              variant="glass"
                              size="sm"
                            >
                              <FaEdit className="mr-1" />
                              Edit
                            </Button>
                            <Button asChild variant="glass" size="sm">
                              <Link to={`/hackathon/${hackathon.id}`}>
                                <FaEye className="mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button
                              onClick={() =>
                                handleDeleteHackathon(hackathon.id)
                              }
                              variant="glass"
                              size="sm"
                              disabled={isDeleting === hackathon.id}
                              className="text-red-400 hover:text-red-300"
                            >
                              {isDeleting === hackathon.id ? (
                                <div className="loading-spinner w-4 h-4" />
                              ) : (
                                <FaTrash className="mr-1" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {userHackathons.length === 0 && (
                    <Card className="glass-dark text-center py-16">
                      <CardContent>
                        <div className="max-w-md mx-auto">
                          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                            <FaPlus className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-4">
                            No Hackathons Yet
                          </h3>
                          <p className="text-gray-400 mb-8">
                            Create your first hackathon to start building an
                            amazing developer community.
                          </p>
                          <Button asChild variant="cyber">
                            <Link to="/create-hackathon">
                              <FaPlus className="mr-2" />
                              Create Your First Hackathon
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  My Participations
                </h2>

                <div className="grid gap-6">
                  {myParticipations.map(({ hackathon, participant }) => (
                    <Card key={hackathon.id} className="card-3d glass-dark">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">
                              {hackathon.title}
                            </h3>
                            <p className="text-gray-400 mb-4 line-clamp-2">
                              {hackathon.description}
                            </p>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                              <div className="flex items-center">
                                <FaCalendarAlt className="mr-1 text-blue-400" />
                                {formatDate(hackathon.startDate)} -{" "}
                                {formatDate(hackathon.endDate)}
                              </div>
                              {hackathon.location && (
                                <div className="flex items-center">
                                  <FaMapMarkerAlt className="mr-1 text-purple-400" />
                                  {hackathon.location}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-3">
                              <div>
                                <span className="text-sm text-gray-400 mr-2">
                                  Status:
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    participant.status === "approved"
                                      ? "bg-green-500/20 text-green-400"
                                      : participant.status === "rejected"
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-yellow-500/20 text-yellow-400"
                                  }`}
                                >
                                  {participant.status}
                                </span>
                              </div>

                              {/* Submission indicator */}
                              {participant.projectSubmission &&
                              (participant.projectSubmission.githubLink ||
                                participant.projectSubmission
                                  .projectDescription ||
                                participant.projectSubmission.liveUrl) ? (
                                <div className="text-sm text-gray-300">
                                  <span className="font-medium">Submitted</span>
                                  <span className="ml-2 text-xs text-gray-400">
                                    •{" "}
                                    <a
                                      href={`/hackathon/${hackathon.id}#submissions`}
                                      className="text-blue-400 hover:underline"
                                    >
                                      View
                                    </a>
                                  </span>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">
                                  <span>No submission</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <Button asChild variant="glass" size="sm">
                              <Link to={`/hackathon/${hackathon.id}`}>
                                <FaEye className="mr-1" />
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {myParticipations.length === 0 && (
                    <Card className="glass-dark text-center py-16">
                      <CardContent>
                        <div className="max-w-md mx-auto">
                          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                            <FaRocket className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-4">
                            No Participations Yet
                          </h3>
                          <p className="text-gray-400 mb-8">
                            Join exciting hackathons to showcase your skills and
                            compete with developers worldwide.
                          </p>
                          <Button asChild variant="cyber">
                            <Link to="/hackathons">
                              <FaEye className="mr-2" />
                              Explore Hackathons
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && user.role === "participant" && (
          <div>
            <CreateProfile />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
