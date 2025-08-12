import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaSignOutAlt,
  FaTrophy,
  FaCode,
  FaChartLine,
  FaBell,
  FaStar,
  FaGithub,
  FaExternalLinkAlt,
  FaClock,
  FaMapMarkerAlt,
  FaAward,
  FaFire,
  FaRocket,
  FaEye,
  FaDownload,
  FaShare,
  FaUser,
  FaSearch,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useHackathons } from "../context/HackathonContext";
import { Participant, Hackathon } from "../types";
import * as hackathonService from "../services/hackathonService";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    userHackathons,
    deleteHackathon,
    allHackathons,
    addHackathon,
    updateHackathon,
  } = useHackathons();

  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedHackathon, setSelectedHackathon] = useState<string | null>(
    null
  );
  const [activeParticipantTab, setActiveParticipantTab] = useState("pending");
  const [myParticipations, setMyParticipations] = useState<
    { hackathon: Hackathon; participant: Participant }[]
  >([]);
  const [isWithdrawing, setIsWithdrawing] = useState<string | null>(null);

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

  const handleParticipantAction = (
    hackathonId: string,
    participantId: string,
    status: "approved" | "rejected"
  ) => {
    const hackathon = userHackathons.find((h) => h.id === hackathonId);
    if (!hackathon) return;

    const updatedParticipants = hackathon.participants?.map((participant) =>
      participant.id === participantId
        ? { ...participant, status }
        : participant
    );

    const updatedHackathon = {
      ...hackathon,
      participants: updatedParticipants,
    };

    updateHackathon(updatedHackathon);
  };

  const getFilteredParticipants = (hackathonId: string, status: string) => {
    const hackathon = userHackathons.find((h) => h.id === hackathonId);
    if (
      !hackathon ||
      !hackathon.participants ||
      hackathon.participants.length === 0
    ) {
      return [];
    }

    if (status === "all") {
      return hackathon.participants;
    }

    return hackathon.participants.filter((p) => p.status === status);
  };

  const handleWithdraw = async (hackathonId: string, participantId: string) => {
    if (
      window.confirm("Are you sure you want to withdraw from this hackathon?")
    ) {
      setIsWithdrawing(hackathonId);
      try {
        await hackathonService.withdrawParticipant(hackathonId, participantId);

        setMyParticipations((prev) =>
          prev.filter(
            (p) =>
              !(
                p.hackathon.id === hackathonId &&
                p.participant.id === participantId
              )
          )
        );
      } catch (error) {
        console.error("Error withdrawing from hackathon:", error);
        alert("Failed to withdraw from the hackathon. Please try again.");
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
      return "Not Submitted";
    }
    if (participant.projectSubmission.evaluation) {
      return `Evaluated (Score: ${participant.projectSubmission.evaluation.score})`;
    }
    return "Submitted";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Calculate stats for participant dashboard
  const participantStats = {
    total: myParticipations.length,
    approved: myParticipations.filter(
      (p) => p.participant.status === "approved"
    ).length,
    pending: myParticipations.filter((p) => p.participant.status === "pending")
      .length,
    submitted: myParticipations.filter((p) => p.participant.projectSubmission)
      .length,
  };

  // Calculate stats for host dashboard
  const hostStats = {
    total: userHackathons.length,
    totalParticipants: userHackathons.reduce(
      (acc, h) => acc + (h.participants?.length || 0),
      0
    ),
    activeHackathons: userHackathons.filter(
      (h) => new Date(h.endDate) > new Date()
    ).length,
    completedHackathons: userHackathons.filter(
      (h) => new Date(h.endDate) <= new Date()
    ).length,
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Welcome back, {user.name || "User"}! 👋
            </h1>
            <p className="text-gray-400 text-lg">
              {user.role === "host"
                ? "Manage your hackathons and participants"
                : "Track your hackathon journey"}
            </p>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30">
                <FaUser className="mr-2" />
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            {user.role === "host" && (
              <Button asChild variant="cyber" size="lg">
                <Link to="/create-hackathon">
                  <FaPlus className="mr-2" /> Create Hackathon
                </Link>
              </Button>
            )}
            <Button variant="glass" size="lg">
              <FaBell className="mr-2" /> Notifications
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user.role === "participant" ? (
            <>
              <Card className="card-3d glass-dark">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">
                        Total Registrations
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {participantStats.total}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <FaRocket className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-3d glass-dark">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">
                        Approved
                      </p>
                      <p className="text-3xl font-bold text-green-400">
                        {participantStats.approved}
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <FaCheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-3d glass-dark">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">
                        Pending
                      </p>
                      <p className="text-3xl font-bold text-yellow-400">
                        {participantStats.pending}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-full">
                      <FaClock className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-3d glass-dark">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">
                        Projects Submitted
                      </p>
                      <p className="text-3xl font-bold text-purple-400">
                        {participantStats.submitted}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-full">
                      <FaCode className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="card-3d glass-dark">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">
                        Total Hackathons
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {hostStats.total}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <FaTrophy className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-3d glass-dark">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">
                        Total Participants
                      </p>
                      <p className="text-3xl font-bold text-green-400">
                        {hostStats.totalParticipants}
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <FaUsers className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-3d glass-dark">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">
                        Active Events
                      </p>
                      <p className="text-3xl font-bold text-yellow-400">
                        {hostStats.activeHackathons}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-full">
                      <FaFire className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-3d glass-dark">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">
                        Completed
                      </p>
                      <p className="text-3xl font-bold text-purple-400">
                        {hostStats.completedHackathons}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-full">
                      <FaAward className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Navigation Tabs */}
        <Card className="glass-dark mb-8">
          <CardContent className="p-0">
            <div className="flex overflow-x-auto">
              <button
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === "overview"
                    ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                <FaChartLine className="inline mr-2" />
                Overview
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === "hackathons"
                    ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
                onClick={() => setActiveTab("hackathons")}
              >
                <FaTrophy className="inline mr-2" />
                {user.role === "host" ? "My Hackathons" : "My Registrations"}
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === "achievements"
                    ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
                onClick={() => setActiveTab("achievements")}
              >
                <FaAward className="inline mr-2" />
                Achievements
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === "profile"
                    ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <FaUser className="inline mr-2" />
                Profile
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card className="glass-dark">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FaClock className="mr-2 text-blue-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.role === "participant"
                    ? myParticipations
                        .slice(0, 5)
                        .map(({ hackathon, participant }) => (
                          <div
                            key={`${hackathon.id}-${participant.id}`}
                            className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/30"
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${
                                participant.status === "approved"
                                  ? "bg-green-400"
                                  : participant.status === "rejected"
                                  ? "bg-red-400"
                                  : "bg-yellow-400"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <p className="text-white font-medium">
                                {hackathon.title}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Status: {participant.status}
                              </p>
                            </div>
                            <span className="text-gray-400 text-sm">
                              {formatDate(hackathon.startDate)}
                            </span>
                          </div>
                        ))
                    : userHackathons.slice(0, 5).map((hackathon) => (
                        <div
                          key={hackathon.id}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/30"
                        >
                          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {hackathon.title}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {hackathon.participants?.length || 0} participants
                            </p>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {formatDate(hackathon.startDate)}
                          </span>
                        </div>
                      ))}
                  {((user.role === "participant" &&
                    myParticipations.length === 0) ||
                    (user.role === "host" && userHackathons.length === 0)) && (
                    <div className="text-center py-8 text-gray-400">
                      <FaRocket className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No recent activity</p>
                      <p className="text-sm">
                        {user.role === "participant"
                          ? "Start by registering for a hackathon!"
                          : "Create your first hackathon to get started!"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-dark">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FaRocket className="mr-2 text-purple-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {user.role === "participant" ? (
                    <>
                      <Button
                        asChild
                        variant="cyber"
                        className="w-full justify-start"
                      >
                        <Link to="/hackathons">
                          <FaSearch className="mr-2" />
                          Browse Hackathons
                        </Link>
                      </Button>
                      <Button variant="glass" className="w-full justify-start">
                        <FaUser className="mr-2" />
                        Update Profile
                      </Button>
                      <Button variant="glass" className="w-full justify-start">
                        <FaGithub className="mr-2" />
                        Connect GitHub
                      </Button>
                      <Button variant="glass" className="w-full justify-start">
                        <FaDownload className="mr-2" />
                        Download Certificate
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="cyber"
                        className="w-full justify-start"
                      >
                        <Link to="/create-hackathon">
                          <FaPlus className="mr-2" />
                          Create New Hackathon
                        </Link>
                      </Button>
                      <Button variant="glass" className="w-full justify-start">
                        <FaChartLine className="mr-2" />
                        View Analytics
                      </Button>
                      <Button variant="glass" className="w-full justify-start">
                        <FaShare className="mr-2" />
                        Share Hackathon
                      </Button>
                      <Button variant="glass" className="w-full justify-start">
                        <FaDownload className="mr-2" />
                        Export Data
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "hackathons" && (
          <div>
            {user.role === "participant" ? (
              myParticipations.length > 0 ? (
                <div className="grid gap-6">
                  {myParticipations.map(({ hackathon, participant }) => (
                    <Card
                      key={`${hackathon.id}-${participant.id}`}
                      className="card-3d glass-dark"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="lg:w-1/4">
                            <img
                              src={
                                hackathon.image ||
                                "https://via.placeholder.com/300x200?text=Hackathon"
                              }
                              alt={hackathon.title}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
                              <div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                  {hackathon.title}
                                </h3>
                                <p className="text-gray-400 mb-4 line-clamp-2">
                                  {hackathon.description}
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                                  <div className="flex items-center">
                                    <FaCalendarAlt className="mr-2 text-blue-400" />
                                    {formatDate(hackathon.startDate)} -{" "}
                                    {formatDate(hackathon.endDate)}
                                  </div>
                                  <div className="flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-purple-400" />
                                    {hackathon.location}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
                                    {hackathon.category}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                      participant.status === "approved"
                                        ? "bg-green-500/20 text-green-400"
                                        : participant.status === "rejected"
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                    }`}
                                  >
                                    {participant.status
                                      .charAt(0)
                                      .toUpperCase() +
                                      participant.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 mt-4 lg:mt-0">
                                <Button asChild variant="cyber" size="sm">
                                  <Link to={`/hackathon/${hackathon.id}`}>
                                    <FaEye className="mr-2" />
                                    View Details
                                  </Link>
                                </Button>
                                {participant.status === "approved" && (
                                  <Button
                                    onClick={() =>
                                      handleSubmitProject(
                                        hackathon.id,
                                        participant.id
                                      )
                                    }
                                    variant="glass"
                                    size="sm"
                                  >
                                    <FaCode className="mr-2" />
                                    Submit Project
                                  </Button>
                                )}
                                <Button
                                  onClick={() =>
                                    handleWithdraw(hackathon.id, participant.id)
                                  }
                                  variant="outline"
                                  size="sm"
                                  disabled={isWithdrawing === hackathon.id}
                                  className="text-red-400 border-red-400 hover:bg-red-500/10"
                                >
                                  <FaSignOutAlt className="mr-2" />
                                  {isWithdrawing === hackathon.id
                                    ? "Withdrawing..."
                                    : "Withdraw"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass-dark text-center py-16">
                  <CardContent>
                    <FaRocket className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      No Hackathons Yet
                    </h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      You haven't registered for any hackathons yet. Start your
                      journey by exploring available hackathons!
                    </p>
                    <Button asChild variant="cyber" size="lg">
                      <Link to="/hackathons">
                        <FaSearch className="mr-2" />
                        Browse Hackathons
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            ) : // Host hackathons view
            userHackathons.length > 0 ? (
              <div className="grid gap-6">
                {userHackathons.map((hackathon) => (
                  <Card key={hackathon.id} className="card-3d glass-dark">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-1/4">
                          <img
                            src={
                              hackathon.image ||
                              "https://via.placeholder.com/300x200?text=Hackathon"
                            }
                            alt={hackathon.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-2">
                                {hackathon.title}
                              </h3>
                              <p className="text-gray-400 mb-4 line-clamp-2">
                                {hackathon.description}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                                <div className="flex items-center">
                                  <FaCalendarAlt className="mr-2 text-blue-400" />
                                  {formatDate(hackathon.startDate)} -{" "}
                                  {formatDate(hackathon.endDate)}
                                </div>
                                <div className="flex items-center">
                                  <FaUsers className="mr-2 text-green-400" />
                                  {hackathon.participants?.length || 0}{" "}
                                  Participants
                                </div>
                              </div>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
                                {hackathon.category}
                              </span>
                            </div>
                            <div className="flex flex-col gap-2 mt-4 lg:mt-0">
                              <Button
                                onClick={() =>
                                  handleEditHackathon(hackathon.id)
                                }
                                variant="cyber"
                                size="sm"
                              >
                                <FaEdit className="mr-2" />
                                Edit
                              </Button>
                              <Button
                                onClick={() =>
                                  setSelectedHackathon(
                                    selectedHackathon === hackathon.id
                                      ? null
                                      : hackathon.id
                                  )
                                }
                                variant="glass"
                                size="sm"
                              >
                                <FaUsers className="mr-2" />
                                Manage Participants
                              </Button>
                              <Button
                                onClick={() =>
                                  handleDeleteHackathon(hackathon.id)
                                }
                                variant="outline"
                                size="sm"
                                disabled={isDeleting === hackathon.id}
                                className="text-red-400 border-red-400 hover:bg-red-500/10"
                              >
                                <FaTrash className="mr-2" />
                                {isDeleting === hackathon.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </div>
                          </div>

                          {/* Participants Management */}
                          {selectedHackathon === hackathon.id &&
                            hackathon.participants &&
                            hackathon.participants.length > 0 && (
                              <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-lg font-medium text-white">
                                    Participants Management
                                  </h4>
                                </div>

                                <div className="mb-4 flex gap-2 overflow-x-auto">
                                  {[
                                    "all",
                                    "pending",
                                    "approved",
                                    "rejected",
                                  ].map((status) => (
                                    <button
                                      key={status}
                                      className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                                        activeParticipantTab === status
                                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                      }`}
                                      onClick={() =>
                                        setActiveParticipantTab(status)
                                      }
                                    >
                                      {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                      (
                                      {status === "all"
                                        ? hackathon.participants.length
                                        : hackathon.participants.filter(
                                            (p) => p.status === status
                                          ).length}
                                      )
                                    </button>
                                  ))}
                                </div>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                  {getFilteredParticipants(
                                    hackathon.id,
                                    activeParticipantTab
                                  ).map((participant: Participant) => (
                                    <div
                                      key={participant.id}
                                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                          <div>
                                            <p className="text-white font-medium">
                                              {participant.name}
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                              {participant.email}
                                            </p>
                                          </div>
                                          <span
                                            className={`px-2 py-1 text-xs rounded-full ${
                                              participant.status === "approved"
                                                ? "bg-green-500/20 text-green-400"
                                                : participant.status ===
                                                  "rejected"
                                                ? "bg-red-500/20 text-red-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                            }`}
                                          >
                                            {participant.status}
                                          </span>
                                        </div>
                                        {participant.skills &&
                                          participant.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                              {participant.skills
                                                .slice(0, 3)
                                                .map((skill, idx) => (
                                                  <span
                                                    key={idx}
                                                    className="inline-block bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded"
                                                  >
                                                    {skill}
                                                  </span>
                                                ))}
                                              {participant.skills.length >
                                                3 && (
                                                <span className="text-gray-400 text-xs">
                                                  +
                                                  {participant.skills.length -
                                                    3}{" "}
                                                  more
                                                </span>
                                              )}
                                            </div>
                                          )}
                                      </div>
                                      {participant.status === "pending" && (
                                        <div className="flex gap-2">
                                          <Button
                                            onClick={() =>
                                              handleParticipantAction(
                                                hackathon.id,
                                                participant.id,
                                                "approved"
                                              )
                                            }
                                            size="sm"
                                            className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30"
                                          >
                                            <FaCheckCircle />
                                          </Button>
                                          <Button
                                            onClick={() =>
                                              handleParticipantAction(
                                                hackathon.id,
                                                participant.id,
                                                "rejected"
                                              )
                                            }
                                            size="sm"
                                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                                          >
                                            <FaTimesCircle />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-dark text-center py-16">
                <CardContent>
                  <FaTrophy className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    No Hackathons Created
                  </h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    You haven't created any hackathons yet. Start by creating
                    your first hackathon and building a community!
                  </p>
                  <Button asChild variant="cyber" size="lg">
                    <Link to="/create-hackathon">
                      <FaPlus className="mr-2" />
                      Create Your First Hackathon
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "achievements" && (
          <Card className="glass-dark text-center py-16">
            <CardContent>
              <FaAward className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Achievements Coming Soon
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                We're working on an exciting achievements system to recognize
                your hackathon journey!
              </p>
            </CardContent>
          </Card>
        )}

        {activeTab === "profile" && (
          <Card className="glass-dark">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FaUser className="mr-2 text-blue-400" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Name
                  </label>
                  <div className="p-3 bg-gray-800/50 rounded-lg text-white">
                    {user.name}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="p-3 bg-gray-800/50 rounded-lg text-white">
                    {user.email}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Role
                  </label>
                  <div className="p-3 bg-gray-800/50 rounded-lg text-white capitalize">
                    {user.role}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Member Since
                  </label>
                  <div className="p-3 bg-gray-800/50 rounded-lg text-white">
                    {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <Button variant="cyber">Update Profile</Button>
                <Button variant="glass">Change Password</Button>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="text-red-400 border-red-400 hover:bg-red-500/10"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
