import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUsers,
  FaTrophy,
  FaClock,
  FaGithub,
  FaCode,
  FaLink,
  FaEdit,
  FaTrash,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import { useHackathons } from "../context/HackathonContext";
import { useAuth } from "../context/AuthContext";
import { Hackathon, Participant } from "../types";
import * as hackathonService from "../services/hackathonService";

// Define additional types for the hackathon details page
interface Timeline {
  date: string;
  event: string;
}

interface Prize {
  place: string;
  amount: string;
  description: string;
}

interface Submission {
  id: string;
  teamName: string;
  projectTitle: string;
  description: string;
  githubLink: string;
  demoLink?: string;
  liveUrl?: string;
  submissionDate: string;
  participantName?: string;
  participantEmail?: string;
}

// Extended interface that includes both required Hackathon and optional detail fields
interface HackathonDetails extends Omit<Hackathon, "participants"> {
  longDescription?: string;
  rules?: string[];
  timeline?: Timeline[];
  submissions?: Submission[];
  prizeDetails?: Prize[];
  participantsCount?: number;
  participants?: Participant[];
}

// Add a PaymentUI component at the top level before the HackathonDetails component
interface PaymentUIProps {
  participant: Participant;
  hackathonId: string;
  registrationFee: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentUI = ({
  participant,
  hackathonId,
  registrationFee,
  onSuccess,
  onCancel,
}: PaymentUIProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setIsProcessing(true);
    setError("");

    try {
      // Extract numeric amount from registration fee (e.g. "₹500" -> 500)
      const amount = parseInt(registrationFee.replace(/[^0-9]/g, ""));

      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid registration fee");
      }

      // Try to create a payment order
      try {
        const orderResponse = await hackathonService.createPaymentOrder(
          hackathonId,
          participant.id,
          amount
        );
        console.log("Payment order created:", orderResponse);

        // Handling for test/demo environment - simulate success
        if (import.meta.env.DEV || !orderResponse.key_id) {
          console.log("In development mode, simulating payment success");
          // Simulating payment completion for development
          setTimeout(() => {
            setIsProcessing(false);
            onSuccess();
          }, 2000);
          return;
        }

        // If we get here, we're in production with Razorpay configured
        // Implement actual Razorpay checkout here
        // This would be replaced with actual Razorpay implementation
      } catch (orderError: any) {
        // Check for specific API errors
        if (orderError.response?.status === 503) {
          console.log("Payment service unavailable, likely in fallback mode");
          // For demo purposes, we'll proceed with a successful payment in fallback mode
          setTimeout(() => {
            setIsProcessing(false);
            onSuccess();
          }, 2000);
          return;
        }

        // Other API errors
        console.error(
          "API Error:",
          orderError.response?.data?.message || orderError.message
        );
        throw new Error(
          orderError.response?.data?.message || "Failed to create payment order"
        );
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(error.message || "Failed to process payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="glass-dark border border-white/20 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Complete Registration Payment
        </h2>
        <p className="mb-4 text-gray-300">
          Registration fee:{" "}
          <span className="font-semibold text-white">{registrationFee}</span>
        </p>

        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-4 rounded">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-white/20 rounded-md text-gray-300 hover:bg-white/10 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Pay Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const HackathonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteHackathon } = useHackathons();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<HackathonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    college: "",
    skills: "",
    experience: "",
    teamName: "",
    teammates: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [registeredParticipant, setRegisteredParticipant] = useState<any>(null);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [showProjectSubmission, setShowProjectSubmission] = useState(false);
  const [projectData, setProjectData] = useState({
    githubLink: "",
    projectDescription: "",
    liveUrl: "",
  });
  const [projectSubmissionError, setProjectSubmissionError] = useState("");
  const [projectSubmissionSuccess, setProjectSubmissionSuccess] =
    useState(false);

  // Editing states
  const [editingRules, setEditingRules] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState(false);
  const [editingPrizes, setEditingPrizes] = useState(false);
  const [showDeclareModalFor, setShowDeclareModalFor] = useState<string | null>(
    null
  );
  const [winnerPosition, setWinnerPosition] = useState<"1st" | "2nd" | "3rd">(
    "1st"
  );
  const [winnerDescription, setWinnerDescription] = useState("");
  const [isDeclaring, setIsDeclaring] = useState(false);
  const [newRule, setNewRule] = useState("");
  const [newTimelineEvent, setNewTimelineEvent] = useState({
    date: "",
    event: "",
  });
  const [newPrize, setNewPrize] = useState({
    place: "",
    amount: "",
    description: "",
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    const fetchHackathon = async () => {
      if (id) {
        // Always fetch latest from backend for participants
        const latest = await hackathonService.getHackathonById(id);
        if (latest) {
          setHackathon({
            ...latest,
            participantsCount: latest.participants?.length || 0,
          });
          if (user && latest.participants) {
            const userParticipation = latest.participants.find(
              (p) => p.userId === user.id
            );
            setIsUserRegistered(!!userParticipation);
            if (userParticipation) {
              setRegisteredParticipant(userParticipation);
            }
          }
        } else {
          setHackathon(null);
        }
        setLoading(false);
      }
    };
    fetchHackathon();
    interval = setInterval(fetchHackathon, 5000); // Poll every 5 seconds
    return () => interval && clearInterval(interval);
  }, [id, user]);

  const handleDeleteHackathon = async () => {
    if (!hackathon || !id) return;

    if (
      window.confirm(
        "Are you sure you want to delete this hackathon? This action cannot be undone."
      )
    ) {
      setIsDeleting(true);
      try {
        await deleteHackathon(id);
        navigate("/hackathons");
      } catch (error) {
        console.error("Error deleting hackathon:", error);
        setIsDeleting(false);
      }
    }
  };

  const handleRegistrationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRegistrationData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateRegistrationForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      "name",
      "email",
      "phone",
      "college",
      "skills",
      "experience",
      "teamName",
    ];

    requiredFields.forEach((field) => {
      if (
        !registrationData[field as keyof typeof registrationData] ||
        registrationData[field as keyof typeof registrationData]
          .toString()
          .trim() === ""
      ) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    // Validate email format
    if (
      registrationData.email &&
      !/\S+@\S+\.\S+/.test(registrationData.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate phone number (basic validation)
    if (
      registrationData.phone &&
      !/^\d{10}$/.test(registrationData.phone.replace(/\D/g, ""))
    ) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegistrationForm()) return;

    // Double check the user hasn't already registered
    if (isUserRegistered) {
      setFormErrors((prev) => ({
        ...prev,
        submit:
          "You have already registered for this hackathon. Check your dashboard for details.",
      }));
      return;
    }

    // Prevent hosts from registering
    if (user?.role === "host") {
      setFormErrors((prev) => ({
        ...prev,
        submit: "Hosts are not allowed to register for hackathons.",
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user || !hackathon) {
        throw new Error("User not logged in or hackathon not found");
      }

      // Create participant object
      const newParticipant: Participant = {
        id: `participant-${Date.now()}`,
        userId: user.id,
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone,
        college: registrationData.college,
        skills: registrationData.skills.split(",").map((skill) => skill.trim()),
        experience: registrationData.experience,
        teamName: registrationData.teamName,
        teammates: registrationData.teammates
          .split(",")
          .map((teammate) => teammate.trim())
          .filter((teammate) => teammate !== ""),
        submissionDate: new Date().toISOString(),
        status:
          parseInt(hackathon.registrationFee || "0") === 0 ||
          (hackathon.registrationFee || "").toLowerCase().includes("free")
            ? "approved"
            : "pending",
      };

      // Register participant using the API service instead of directly updating the hackathon
      const response = await hackathonService.registerParticipant(
        hackathon.id,
        newParticipant
      );

      // Check if payment is required - parse registration fee to check if it's free
      const registrationFee = hackathon.registrationFee || "0";
      const feeAmount = parseInt(registrationFee.replace(/[^0-9]/g, "")) || 0;
      const isFree =
        feeAmount === 0 || registrationFee.toLowerCase().includes("free");

      if (!isFree && response.hackathonPaymentRequired) {
        // Show payment UI for paid hackathons
        setShowPaymentUI(true);
        setRegisteredParticipant(response);
        // Don't set registration success yet until payment is completed
      } else {
        // No payment required (free hackathon), registration is complete
        setRegistrationSuccess(true);
        setShowRegistrationForm(false);

        // Update local state - fetch the updated hackathon to show the new participant
        const updatedHackathon = await hackathonService.getHackathonById(
          hackathon.id
        );
        if (updatedHackathon) {
          setHackathon(updatedHackathon);
          // Set registeredParticipant to the current user's participant object
          if (user && updatedHackathon.participants) {
            const userParticipation = updatedHackathon.participants.find(
              (p) => p.userId === user.id
            );
            if (userParticipation) {
              setRegisteredParticipant(userParticipation);
            }
          }
        }

        // Mark user as registered
        setIsUserRegistered(true);

        // Reset form data
        setRegistrationData({
          name: user?.name || "",
          email: user?.email || "",
          phone: "",
          college: "",
          skills: "",
          experience: "",
          teamName: "",
          teammates: "",
        });

        // Auto-close form after 2 seconds
        setTimeout(() => {
          setShowRegistrationForm(false);
        }, 2000);
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle specific error for already registered user
      if (
        error.response?.data?.message ===
        "You have already registered for this hackathon"
      ) {
        setFormErrors((prev) => ({
          ...prev,
          submit: "You have already registered for this hackathon",
        }));
        setIsUserRegistered(true);
      } else {
        setFormErrors((prev) => ({
          ...prev,
          submit: "Failed to register. Please try again.",
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!hackathon || !registeredParticipant) return;

    // Update hackathon with the newly paid participant
    try {
      const updatedHackathon = await hackathonService.getHackathonById(
        hackathon.id
      );
      if (updatedHackathon) {
        setHackathon(updatedHackathon);
      }

      // Hide payment UI and show success
      setShowPaymentUI(false);
      setRegistrationSuccess(true);

      // Mark user as registered
      setIsUserRegistered(true);
    } catch (error) {
      console.error("Error updating hackathon after payment:", error);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentUI(false);
    // User still registered but payment is pending
    setRegistrationSuccess(true);
  };

  // Add a new function to handle withdrawal
  const handleWithdrawParticipation = async () => {
    if (!user || !hackathon || !id) return;

    if (
      window.confirm("Are you sure you want to withdraw from this hackathon?")
    ) {
      try {
        // Find the participant ID for the current user
        const userParticipant = hackathon.participants?.find(
          (p) => p.userId === user.id
        );

        if (!userParticipant) {
          throw new Error("Participant not found");
        }

        await hackathonService.withdrawParticipant(id, userParticipant.id);
        // Update local state
        setIsUserRegistered(false);
        setRegistrationSuccess(false);

        // Fetch updated hackathon data
        const updatedHackathon = await hackathonService.getHackathonById(id);
        if (updatedHackathon) {
          setHackathon(updatedHackathon);
        }
      } catch (error) {
        console.error("Failed to withdraw from hackathon:", error);
        alert("Failed to withdraw from hackathon. Please try again.");
      }
    }
  };

  const handleRegisterClick = () => {
    // Prevent hosts from registering
    if (user?.role === "host") {
      return; // Button should be disabled for hosts, but this is an extra safety check
    }

    // Show registration form for non-host users
    setShowRegistrationForm(true);
  };

  const handleProjectSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectSubmissionError("");
    setIsSubmitting(true);

    try {
      if (
        !projectData.githubLink ||
        !projectData.projectDescription ||
        !projectData.liveUrl
      ) {
        setProjectSubmissionError(
          "Please fill in all required fields (GitHub Link, Description, and Live URL)"
        );
        return;
      }

      // Validate GitHub link format
      if (
        !projectData.githubLink.match(
          /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+/
        )
      ) {
        setProjectSubmissionError(
          "Please enter a valid GitHub repository link"
        );
        return;
      }

      // Validate Live URL format
      if (
        !projectData.liveUrl.match(
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
        )
      ) {
        setProjectSubmissionError(
          "Please enter a valid live URL (must start with http:// or https://)"
        );
        return;
      }

      const submission = {
        githubLink: projectData.githubLink,
        projectDescription: projectData.projectDescription,
        liveUrl: projectData.liveUrl,
        submissionDate: new Date().toISOString(),
        teamName: registeredParticipant.teamName,
        participantName: registeredParticipant.name,
        participantEmail: registeredParticipant.email,
      };

      await hackathonService.submitProject(
        hackathon!.id,
        registeredParticipant.id,
        submission
      );
      // Refresh hackathon data so the new submission appears in the UI
      const updated = await hackathonService.getHackathonById(hackathon!.id);
      if (updated) {
        setHackathon(updated);
        // update registered participant reference from updated data
        const updatedParticipant = updated.participants?.find(
          (p) =>
            p.id === registeredParticipant.id ||
            p.userId === registeredParticipant.userId
        );
        if (updatedParticipant) setRegisteredParticipant(updatedParticipant);
      }

      setProjectSubmissionSuccess(true);
      setShowProjectSubmission(false);

      // Reset form data
      setProjectData({
        githubLink: "",
        projectDescription: "",
        liveUrl: "",
      });
    } catch (error: any) {
      setProjectSubmissionError(
        error.message || "Failed to submit project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Hackathon Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The hackathon you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/hackathons"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-semibold transition-colors duration-300"
          >
            Browse Hackathons
          </Link>
        </div>
      </div>
    );
  }

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate if hackathon is active, upcoming, or ended
  const today = new Date();
  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);

  let status = "Upcoming";
  let statusColor = "bg-yellow-500";

  if (today > endDate) {
    status = "Ended";
    statusColor = "bg-gray-500";
  } else if (today >= startDate && today <= endDate) {
    status = "Active";
    statusColor = "bg-green-500";
  }

  // Check if the current user is the creator of this hackathon
  const isCreator = user && hackathon.creatorId === user.id;

  // Handler functions for editing
  const handleAddRule = async () => {
    if (newRule.trim() && hackathon) {
      const updatedRules = [...rulesArray, newRule.trim()];
      setNewRule("");
      // Update hackathon rules immediately for UI
      setHackathon((prev) => (prev ? { ...prev, rules: updatedRules } : null));
      // Persist to backend
      await hackathonService.updateHackathon({
        ...hackathon,
        rules: updatedRules,
      });
    }
  };

  const handleDeleteRule = (index: number) => {
    const updatedRules = rulesArray.filter((_, i) => i !== index);
    setHackathon((prev) => (prev ? { ...prev, rules: updatedRules } : null));
  };

  const handleAddTimelineEvent = () => {
    if (newTimelineEvent.date && newTimelineEvent.event) {
      const updatedTimeline = [...timelineArray, newTimelineEvent];
      setNewTimelineEvent({ date: "", event: "" });
      setHackathon((prev) =>
        prev ? { ...prev, timeline: updatedTimeline } : null
      );
    }
  };

  const handleDeleteTimelineEvent = (index: number) => {
    const updatedTimeline = timelineArray.filter((_, i) => i !== index);
    setHackathon((prev) =>
      prev ? { ...prev, timeline: updatedTimeline } : null
    );
  };

  const handleAddPrize = async () => {
    if (
      newPrize.place &&
      newPrize.amount &&
      newPrize.description &&
      hackathon
    ) {
      const updatedPrizes = [...prizesArray, newPrize];
      setNewPrize({ place: "", amount: "", description: "" });
      setHackathon((prev) =>
        prev ? { ...prev, prizeDetails: updatedPrizes } : null
      );
      // Persist to backend
      await hackathonService.updateHackathon({
        ...hackathon,
        prizeDetails: updatedPrizes,
        rules: hackathon.rules || [],
      });
    }
  };

  const handleDeletePrize = (index: number) => {
    const updatedPrizes = prizesArray.filter((_, i) => i !== index);
    setHackathon((prev) =>
      prev ? { ...prev, prizeDetails: updatedPrizes } : null
    );
  };

  // Create prizes array if it doesn't exist but we have individual prizes
  const prizesArray =
    hackathon.prizeDetails ||
    (hackathon.prizes
      ? [
          {
            place: "Prize Pool",
            amount: hackathon.prizes,
            description: "Total prize pool",
          },
        ]
      : []);

  // Create timeline if it doesn't exist
  const timelineArray =
    hackathon.timeline ||
    ([
      hackathon.registrationDeadline && {
        date: formatDate(hackathon.registrationDeadline),
        event: "Registration Deadline",
      },
      { date: formatDate(hackathon.startDate), event: "Hackathon Starts" },
      { date: formatDate(hackathon.endDate), event: "Submission Deadline" },
    ].filter(Boolean) as Timeline[]);

  // Create rules array if it's a string
  const rulesArray = hackathon.rules || [];

  return (
    <div className="w-full bg-black min-h-screen">
      {showPaymentUI && hackathon && registeredParticipant && (
        <PaymentUI
          participant={registeredParticipant}
          hackathonId={hackathon.id}
          registrationFee={hackathon.registrationFee}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

      <div className="bg-black py-10 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="relative rounded-xl overflow-hidden mb-8">
            <div className="h-80 w-full">
              <img
                src={
                  hackathon.image ||
                  "https://images.unsplash.com/photo-1517048676732-d65bc937f952"
                }
                alt={hackathon.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            </div>

            <div className="absolute bottom-0 left-0 p-8 text-white w-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                  <div
                    className={`${statusColor} text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-3`}
                  >
                    {status}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {hackathon.title}
                  </h1>
                  <p className="text-lg text-gray-200 mb-2">
                    Organized by {hackathon.organizerName || "Unknown"}
                  </p>
                  <div className="flex items-center text-gray-200 text-sm">
                    <FaCalendarAlt className="mr-1" />
                    <span>
                      {formatDate(hackathon.startDate)} -{" "}
                      {formatDate(hackathon.endDate)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col space-y-0 md:space-y-3 space-x-3 md:space-x-0">
                  {isCreator && (
                    <div className="flex space-x-2">
                      <Link
                        to={`/create-hackathon/${hackathon.id}`}
                        className="flex items-center gap-1 glass-dark border border-white/20 hover:bg-white/20 text-white px-3 py-2 rounded transition-colors"
                      >
                        <FaEdit /> Edit
                      </Link>
                      <button
                        onClick={handleDeleteHackathon}
                        disabled={isDeleting}
                        className={`flex items-center gap-1 px-3 py-2 rounded transition-colors ${
                          isDeleting
                            ? "bg-red-500/20 text-red-400 opacity-75"
                            : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20"
                        }`}
                      >
                        <FaTrash /> {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}

                  {status === "Active" && (
                    <button
                      className="glass-dark border border-white/20 opacity-75 cursor-not-allowed text-gray-400 px-4 py-2 rounded-md font-semibold transition-colors duration-300 text-center"
                      disabled
                    >
                      Submit Project
                    </button>
                  )}

                  {status === "Upcoming" && (
                    <>
                      {isUserRegistered ? (
                        <Link
                          to="/dashboard"
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold transition-colors duration-300"
                        >
                          View Registration
                        </Link>
                      ) : user?.role === "host" ? null : (
                        <button
                          onClick={handleRegisterClick}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold transition-colors duration-300 shadow-lg"
                        >
                          Register Now
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-white/20 mb-8">
            <nav className="flex justify-start overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-6 font-medium text-lg border-b-2 whitespace-nowrap min-w-[120px] text-center ${
                  activeTab === "overview"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-transparent text-gray-300 hover:text-white hover:border-white/50"
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => setActiveTab("rules")}
                className={`py-4 px-6 font-medium text-lg border-b-2 whitespace-nowrap min-w-[120px] text-center ${
                  activeTab === "rules"
                    ? "border-blue-600 text-blue-400"
                    : "border-transparent text-gray-300 hover:text-white hover:border-white/50"
                }`}
              >
                Rules
              </button>

              <button
                onClick={() => setActiveTab("prizes")}
                className={`py-4 px-6 font-medium text-lg border-b-2 whitespace-nowrap min-w-[120px] text-center ${
                  activeTab === "prizes"
                    ? "border-blue-600 text-blue-400"
                    : "border-transparent text-gray-300 hover:text-white hover:border-white/50"
                }`}
              >
                Prizes
              </button>

              <button
                onClick={() => setActiveTab("timeline")}
                className={`py-4 px-6 font-medium text-lg border-b-2 whitespace-nowrap min-w-[120px] text-center ${
                  activeTab === "timeline"
                    ? "border-blue-600 text-blue-400"
                    : "border-transparent text-gray-300 hover:text-white hover:border-white/50"
                }`}
              >
                Timeline
              </button>

              <button
                onClick={() => setActiveTab("submissions")}
                className={`py-4 px-6 font-medium text-lg border-b-2 whitespace-nowrap min-w-[120px] text-center ${
                  activeTab === "submissions"
                    ? "border-blue-600 text-blue-400"
                    : "border-transparent text-gray-300 hover:text-white hover:border-white/50"
                }`}
              >
                Submissions
              </button>

              <button
                onClick={() => setActiveTab("participants")}
                className={`py-4 px-6 font-medium text-lg border-b-2 whitespace-nowrap min-w-[120px] text-center ${
                  activeTab === "participants"
                    ? "border-blue-600 text-blue-400"
                    : "border-transparent text-gray-300 hover:text-white hover:border-white/50"
                }`}
              >
                Participants
              </button>
            </nav>
          </div>

          {/* Content based on active tab */}
          <div className="glass-dark p-8 rounded-lg border border-white/20">
            {activeTab === "overview" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  About this Hackathon
                </h2>
                <p className="text-gray-300 mb-6 whitespace-pre-line">
                  {hackathon.longDescription || hackathon.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/10 p-6 rounded-lg border border-white/20">
                    <div className="flex items-center text-blue-400 mb-3">
                      <FaCalendarAlt className="h-6 w-6 mr-2" />
                      <h3 className="text-xl font-semibold">Duration</h3>
                    </div>
                    <p className="text-gray-300">
                      {formatDate(hackathon.startDate)} -{" "}
                      {formatDate(hackathon.endDate)}
                    </p>
                  </div>

                  <div className="bg-white/10 p-6 rounded-lg border border-white/20">
                    <div className="flex items-center text-blue-400 mb-3">
                      <FaUsers className="h-6 w-6 mr-2" />
                      <h3 className="text-xl font-semibold">Team Size</h3>
                    </div>
                    <p className="text-gray-300">
                      {hackathon.teamSize || "No limit"}
                    </p>
                  </div>

                  <div className="bg-white/10 p-6 rounded-lg border border-white/20">
                    <div className="flex items-center text-blue-400 mb-3">
                      <FaTrophy className="h-6 w-6 mr-2" />
                      <h3 className="text-xl font-semibold">Prize Pool</h3>
                    </div>
                    <p className="text-gray-300">
                      {hackathon.prizes || "To be announced"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rules" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Hackathon Rules
                  </h2>
                  {isCreator && (
                    <button
                      onClick={() => setEditingRules(!editingRules)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaEdit className="mr-2" />
                      {editingRules ? "Done" : "Edit Rules"}
                    </button>
                  )}
                </div>

                {rulesArray.length > 0 ? (
                  <ul className="space-y-4 mb-6">
                    {rulesArray.map((rule: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-blue-500/20 text-blue-400 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 border border-blue-500/30">
                          {index + 1}
                        </span>
                        <span className="text-gray-300 flex-1">{rule}</span>
                        {isCreator && editingRules && (
                          <button
                            onClick={() => handleDeleteRule(index)}
                            className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : !isCreator ? (
                  <p className="text-gray-400 italic mb-6">
                    No specific rules have been provided for this hackathon.
                  </p>
                ) : null}

                {isCreator && (editingRules || rulesArray.length === 0) && (
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {rulesArray.length === 0 ? "Add Rules" : "Add New Rule"}
                    </h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        placeholder="Enter a new rule..."
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === "Enter" && handleAddRule()}
                      />
                      <button
                        onClick={handleAddRule}
                        disabled={!newRule.trim()}
                        className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        <FaPlus className="w-4 h-4" />
                      </button>
                    </div>
                    {rulesArray.length === 0 && (
                      <p className="text-gray-400 text-sm mt-2">
                        Add rules to help participants understand the
                        competition guidelines.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "prizes" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Prizes</h2>
                  {isCreator && (
                    <button
                      onClick={() => setEditingPrizes(!editingPrizes)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaEdit className="mr-2" />
                      {editingPrizes ? "Done" : "Edit Prizes"}
                    </button>
                  )}
                </div>

                {prizesArray && prizesArray.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {prizesArray.map((prize: Prize, index: number) => (
                      <div
                        key={index}
                        className={`
                        rounded-lg p-6 text-center border relative group
                        ${
                          index === 0
                            ? "bg-gradient-to-b from-yellow-500/20 to-yellow-400/10 border-yellow-400/30"
                            : ""
                        }
                        ${
                          index === 1
                            ? "bg-gradient-to-b from-gray-600/20 to-gray-500/10 border-gray-400/30"
                            : ""
                        }
                        ${
                          index === 2
                            ? "bg-gradient-to-b from-amber-600/20 to-amber-500/10 border-amber-400/30"
                            : ""
                        }
                        ${index > 2 ? "bg-white/10 border-white/20" : ""}
                      `}
                      >
                        {isCreator && editingPrizes && (
                          <button
                            onClick={() => handleDeletePrize(index)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}

                        <div className="flex items-center justify-center mb-3">
                          <FaTrophy
                            className={`h-8 w-8 mr-2 ${
                              index === 0
                                ? "text-yellow-400"
                                : index === 1
                                ? "text-gray-400"
                                : index === 2
                                ? "text-amber-400"
                                : "text-blue-400"
                            }`}
                          />
                        </div>

                        <h3 className="text-xl font-bold mb-2 text-white">
                          {prize.place}
                        </h3>
                        <div className="text-3xl font-bold text-blue-400 mb-2">
                          {prize.amount}
                        </div>
                        <p className="text-gray-300">{prize.description}</p>
                      </div>
                    ))}
                  </div>
                ) : !isCreator ? (
                  <div className="bg-white/10 rounded-lg p-8 text-center border border-white/20 mb-6">
                    <FaTrophy className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-white">
                      Prize Information
                    </h3>
                    <p className="text-gray-300">
                      Prize details will be announced soon.
                    </p>
                  </div>
                ) : null}

                {isCreator && (editingPrizes || prizesArray.length === 0) && (
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {prizesArray.length === 0
                        ? "Add Prize Information"
                        : "Add New Prize"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={newPrize.place}
                        onChange={(e) =>
                          setNewPrize((prev) => ({
                            ...prev,
                            place: e.target.value,
                          }))
                        }
                        placeholder="Prize position (e.g., 1st Place)"
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={newPrize.amount}
                        onChange={(e) =>
                          setNewPrize((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        placeholder="Prize amount (e.g., $1000)"
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={newPrize.description}
                        onChange={(e) =>
                          setNewPrize((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Prize description"
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleAddPrize}
                        disabled={
                          !newPrize.place ||
                          !newPrize.amount ||
                          !newPrize.description
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        <FaPlus className="mr-2 w-4 h-4" />
                        Add Prize
                      </button>
                    </div>
                    {prizesArray.length === 0 && (
                      <p className="text-gray-400 text-sm mt-2">
                        Add prize information to motivate participants and
                        showcase the rewards.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "timeline" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Timeline</h2>
                  {isCreator && (
                    <button
                      onClick={() => setEditingTimeline(!editingTimeline)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaEdit className="mr-2" />
                      {editingTimeline ? "Done" : "Edit Timeline"}
                    </button>
                  )}
                </div>

                {timelineArray.length > 0 ? (
                  <div className="relative border-l-2 border-blue-500/30 pl-6 ml-6 mb-6">
                    {timelineArray.map((item: Timeline, index: number) => (
                      <div key={index} className="mb-10 relative group">
                        <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full border-4 border-blue-500/30 bg-blue-600"></div>
                        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="text-lg font-semibold text-white mb-1">
                                {item.event}
                              </div>
                              <div className="text-blue-400 font-medium">
                                {item.date}
                              </div>
                            </div>
                            {isCreator && editingTimeline && (
                              <button
                                onClick={() => handleDeleteTimelineEvent(index)}
                                className="ml-2 text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !isCreator ? (
                  <div className="text-center py-16 bg-white/10 rounded-lg border border-white/20 mb-6">
                    <FaClock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                      No timeline available
                    </h3>
                    <p className="text-gray-300">
                      Timeline details will be updated soon.
                    </p>
                  </div>
                ) : null}

                {isCreator &&
                  (editingTimeline || timelineArray.length === 0) && (
                    <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        {timelineArray.length === 0
                          ? "Create Timeline"
                          : "Add Timeline Event"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="date"
                          value={newTimelineEvent.date}
                          onChange={(e) =>
                            setNewTimelineEvent((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          className="px-4 py-3 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={newTimelineEvent.event}
                          onChange={(e) =>
                            setNewTimelineEvent((prev) => ({
                              ...prev,
                              event: e.target.value,
                            }))
                          }
                          placeholder="Event description..."
                          className="md:col-span-2 px-4 py-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handleAddTimelineEvent}
                          disabled={
                            !newTimelineEvent.date || !newTimelineEvent.event
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                          <FaPlus className="mr-2 w-4 h-4" />
                          Add Event
                        </button>
                      </div>
                      {timelineArray.length === 0 && (
                        <p className="text-gray-400 text-sm mt-2">
                          Create a timeline to show important dates and
                          milestones for your hackathon.
                        </p>
                      )}
                    </div>
                  )}
              </div>
            )}

            {activeTab === "submissions" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Project Submissions
                </h2>

                {/* Derive submissions from participants' projectSubmission */}
                {hackathon.participants &&
                hackathon.participants.some(
                  (p) =>
                    p.projectSubmission &&
                    (p.projectSubmission.githubLink ||
                      p.projectSubmission.projectDescription ||
                      p.projectSubmission.liveUrl) &&
                    (isCreator ? true : p.userId === user?.id)
                ) ? (
                  <div className="space-y-6">
                    {hackathon.participants
                      .filter((p) => {
                        const hasSubmission =
                          p.projectSubmission &&
                          (p.projectSubmission.githubLink ||
                            p.projectSubmission.projectDescription ||
                            p.projectSubmission.liveUrl);
                        if (!hasSubmission) return false;
                        if (isCreator) return true;
                        return p.userId === user?.id;
                      })
                      .map((p) => {
                        const submission = p.projectSubmission as any;
                        return (
                          <div
                            key={p.id}
                            className="bg-white/10 rounded-lg p-6 border border-white/20"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-semibold text-white mb-1">
                                  {submission.projectTitle ||
                                    "Project Submission"}
                                </h3>
                                <p className="text-gray-300 mb-1">
                                  <span className="font-medium">Team:</span>{" "}
                                  {p.teamName || "—"}
                                </p>
                                <p className="text-gray-300 mb-1">
                                  <span className="font-medium">
                                    Submitted by:
                                  </span>{" "}
                                  {p.name}
                                </p>
                                <p className="text-gray-300 mb-1">
                                  <span className="font-medium">Contact:</span>{" "}
                                  {p.email}
                                </p>
                              </div>
                              <span className="flex items-center text-gray-400 text-sm">
                                <FaClock className="mr-2" />
                                {submission.submissionDate
                                  ? new Date(
                                      submission.submissionDate
                                    ).toLocaleDateString()
                                  : "-"}
                              </span>
                            </div>

                            <p className="text-gray-300 mb-4">
                              {submission.projectDescription}
                            </p>

                            <div className="flex flex-wrap gap-4">
                              {submission.githubLink && (
                                <a
                                  href={submission.githubLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
                                >
                                  <FaGithub className="mr-2" /> GitHub
                                  Repository
                                </a>
                              )}

                              {submission.liveUrl && (
                                <a
                                  href={submission.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
                                >
                                  <FaLink className="mr-2" /> Live Demo
                                </a>
                              )}
                              {/* Declare winner button for creator */}
                              {submission.winner ? (
                                <div className="ml-auto px-3 py-1 bg-green-600 text-black rounded-md text-sm font-semibold">
                                  {submission.winner.position} Winner
                                </div>
                              ) : (
                                isCreator && (
                                  <button
                                    onClick={() => {
                                      setShowDeclareModalFor(p.id);
                                      setWinnerPosition("1st");
                                      setWinnerDescription("");
                                    }}
                                    className="ml-auto px-3 py-2 bg-yellow-600 text-black rounded-md hover:bg-yellow-500"
                                  >
                                    Declare Winner
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    {/* Declare Winner Modal */}
                    {showDeclareModalFor && (
                      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <div className="glass-dark rounded-lg border border-white/20 p-6 max-w-md w-full">
                          <h3 className="text-lg font-semibold text-white mb-4">
                            Declare Winner
                          </h3>
                          <label className="block text-sm text-white mb-2">
                            Position
                          </label>
                          <select
                            value={winnerPosition}
                            onChange={(e) =>
                              setWinnerPosition(e.target.value as any)
                            }
                            className="w-full mb-4 p-2 rounded bg-white/10 text-white"
                          >
                            <option value="1st">1st</option>
                            <option value="2nd">2nd</option>
                            <option value="3rd">3rd</option>
                          </select>
                          <label className="block text-sm text-white mb-2">
                            Message (optional)
                          </label>
                          <textarea
                            value={winnerDescription}
                            onChange={(e) =>
                              setWinnerDescription(e.target.value)
                            }
                            className="w-full mb-4 p-2 rounded bg-white/10 text-white"
                            rows={4}
                          />
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setShowDeclareModalFor(null)}
                              className="px-4 py-2 border border-white/20 rounded text-gray-300"
                              disabled={isDeclaring}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                if (!hackathon || !showDeclareModalFor) return;
                                setIsDeclaring(true);
                                try {
                                  await hackathonService.declareWinner(
                                    hackathon.id,
                                    showDeclareModalFor,
                                    winnerPosition,
                                    winnerDescription,
                                    user?.name
                                  );
                                  // Refresh hackathon
                                  const updated =
                                    await hackathonService.getHackathonById(
                                      hackathon.id
                                    );
                                  if (updated) setHackathon(updated);
                                  if (updated) {
                                    // update local state
                                    setHackathon(updated);
                                    // notify other parts of the app (Dashboard, lists) to refresh their cached hackathons
                                    try {
                                      window.dispatchEvent(
                                        new CustomEvent("hackathon-updated", {
                                          detail: updated,
                                        })
                                      );
                                    } catch (e) {
                                      // ignore in non-browser env
                                    }
                                  }
                                  setShowDeclareModalFor(null);
                                  // immediate feedback to the creator
                                  alert("Winner declared successfully");
                                } catch (err) {
                                  console.error(
                                    "Failed to declare winner",
                                    err
                                  );
                                  alert("Failed to declare winner");
                                } finally {
                                  setIsDeclaring(false);
                                }
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded"
                              disabled={isDeclaring}
                            >
                              {isDeclaring ? "Declaring..." : "Declare"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white/10 rounded-lg border border-white/20">
                    <div className="mx-auto h-16 w-16 text-gray-400">
                      <FaCode className="h-full w-full" />
                    </div>
                    <h3 className="mt-4 text-xl font-medium text-white">
                      No submissions yet
                    </h3>
                    <p className="mt-2 text-gray-300">
                      Projects will appear here once they are submitted.
                    </p>

                    {status === "Active" && (
                      <div className="mt-6">
                        <button
                          className="bg-blue-600 opacity-75 cursor-not-allowed text-white px-4 py-2 rounded-md font-semibold transition-colors duration-300 text-center"
                          disabled
                        >
                          Submit Your Project
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "participants" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Participants
                </h2>
                {hackathon.participants && hackathon.participants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hackathon.participants.map(
                      (participant: Participant, index: number) => (
                        <div
                          key={participant.email || index}
                          className="bg-white/10 rounded-lg p-6 border border-white/20"
                        >
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {participant.name}
                          </h3>
                          <p className="text-gray-300 mb-1">
                            <span className="font-medium">Email:</span>{" "}
                            {participant.email}
                          </p>
                          <p className="text-gray-300 mb-1">
                            <span className="font-medium">Phone:</span>{" "}
                            {participant.phone}
                          </p>
                          <p className="text-gray-300 mb-1">
                            <span className="font-medium">College:</span>{" "}
                            {participant.college}
                          </p>
                          <p className="text-gray-300 mb-1">
                            <span className="font-medium">Experience:</span>{" "}
                            {participant.experience}
                          </p>
                          <p className="text-gray-300">
                            <span className="font-medium">Team:</span>{" "}
                            {participant.teamName}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white/10 rounded-lg border border-white/20">
                    <div className="mx-auto h-16 w-16 text-gray-400">
                      <FaUsers className="h-full w-full" />
                    </div>
                    <h3 className="mt-4 text-xl font-medium text-white">
                      No participants yet
                    </h3>
                    <p className="mt-2 text-gray-300">
                      Participants will appear here once they register.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Registration Status Section */}
          {user && !isCreator && isUserRegistered && (
            <div className="mt-8 glass-dark text-green-300 p-6 rounded-lg border border-green-500/30">
              <div className="flex items-start">
                <div className="bg-green-500/20 rounded-full p-2 mr-4 border border-green-500/30">
                  <svg
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    You're registered for this hackathon!
                  </h3>
                  <p className="text-sm mb-4 text-gray-300">
                    Your registration has been successfully submitted. Check
                    your dashboard for status updates and additional
                    information.
                  </p>
                  <div className="flex gap-3">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Go to Dashboard
                      <svg
                        className="ml-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </Link>
                    <button
                      onClick={handleWithdrawParticipation}
                      className="inline-flex items-center px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors"
                    >
                      Withdraw Registration
                    </button>
                    {isUserRegistered && (
                      <button
                        onClick={() => setShowProjectSubmission(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <FaGithub className="mr-2" />
                        Submit Project
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="glass-dark rounded-lg border border-white/20 shadow-xl w-full max-w-2xl max-h-90vh overflow-y-auto">
            <div className="bg-blue-600 rounded-t-lg py-4 px-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                Register for {hackathon?.title}
              </h2>
              <button
                onClick={() => setShowRegistrationForm(false)}
                className="text-white hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="p-8">
              {formErrors.submit && (
                <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
                  <p className="font-medium">{formErrors.submit}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Full Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={registrationData.name}
                    onChange={handleRegistrationChange}
                    className={`input-modern ${
                      formErrors.name ? "border-red-500" : ""
                    }`}
                    placeholder="Enter your name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-400">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={registrationData.email}
                    onChange={handleRegistrationChange}
                    className={`input-modern ${
                      formErrors.email ? "border-red-500" : ""
                    }`}
                    placeholder="you@example.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-400">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={registrationData.phone}
                    onChange={handleRegistrationChange}
                    className={`input-modern ${
                      formErrors.phone ? "border-red-500" : ""
                    }`}
                    placeholder="Your phone number"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-400">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* College/University */}
                <div>
                  <label
                    htmlFor="college"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    College/University
                  </label>
                  <input
                    type="text"
                    id="college"
                    name="college"
                    value={registrationData.college}
                    onChange={handleRegistrationChange}
                    className="input-modern"
                    placeholder="Your educational institution"
                  />
                </div>

                {/* Skills */}
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="skills"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Skills*
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={registrationData.skills}
                    onChange={handleRegistrationChange}
                    className={`input-modern ${
                      formErrors.skills ? "border-red-500" : ""
                    }`}
                    placeholder="List relevant skills (e.g., React, Python, UI/UX)"
                  />
                  {formErrors.skills && (
                    <p className="mt-1 text-sm text-red-400">
                      {formErrors.skills}
                    </p>
                  )}
                </div>

                {/* Experience */}
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="experience"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Experience
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    rows={3}
                    value={registrationData.experience}
                    onChange={handleRegistrationChange}
                    className="input-modern resize-none"
                    placeholder="Briefly describe your relevant experience"
                  />
                </div>

                {/* Team Name */}
                <div>
                  <label
                    htmlFor="teamName"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Team Name
                  </label>
                  <input
                    type="text"
                    id="teamName"
                    name="teamName"
                    value={registrationData.teamName}
                    onChange={handleRegistrationChange}
                    className="input-modern"
                    placeholder="Your team name (if applicable)"
                  />
                </div>

                {/* Team Members */}
                <div>
                  <label
                    htmlFor="teammates"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Team Members
                  </label>
                  <input
                    type="text"
                    id="teammates"
                    name="teammates"
                    value={registrationData.teammates}
                    onChange={handleRegistrationChange}
                    className="input-modern"
                    placeholder="List teammates (if any), separated by commas"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowRegistrationForm(false)}
                  className="px-4 py-2 border border-white/20 rounded-md text-gray-300 bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Success Modal */}
      {registrationSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="glass-dark rounded-lg border border-green-500/30 shadow-xl w-full max-w-md p-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30 mx-auto">
              <svg
                className="h-8 w-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-300">
              Registration Successful!
            </h2>
            <p className="text-gray-300 mb-6">
              Your registration for{" "}
              <span className="text-blue-400 font-semibold">
                {hackathon?.title}
              </span>{" "}
              has been successfully submitted. The organizer will review your
              application.
            </p>
            <button
              onClick={() => setRegistrationSuccess(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Project Submission Modal */}
      {showProjectSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-dark rounded-lg shadow-xl w-full max-w-2xl border border-white/20">
            <div className="bg-blue-600 rounded-t-lg py-4 px-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                Submit Your Project
              </h2>
              <button
                onClick={() => setShowProjectSubmission(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleProjectSubmission} className="p-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="githubLink"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    GitHub Repository Link*
                  </label>
                  <input
                    type="url"
                    id="githubLink"
                    name="githubLink"
                    value={projectData.githubLink}
                    onChange={(e) =>
                      setProjectData((prev) => ({
                        ...prev,
                        githubLink: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://github.com/username/repository"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="liveUrl"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Live Demo URL*
                  </label>
                  <input
                    type="url"
                    id="liveUrl"
                    name="liveUrl"
                    value={projectData.liveUrl}
                    onChange={(e) =>
                      setProjectData((prev) => ({
                        ...prev,
                        liveUrl: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://your-project-demo.com"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="projectDescription"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Project Description*
                  </label>
                  <textarea
                    id="projectDescription"
                    name="projectDescription"
                    value={projectData.projectDescription}
                    onChange={(e) =>
                      setProjectData((prev) => ({
                        ...prev,
                        projectDescription: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your project, its features, and how it solves the hackathon problem..."
                    required
                  />
                </div>

                {projectSubmissionError && (
                  <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-md p-3">
                    {projectSubmissionError}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProjectSubmission(false)}
                  className="px-4 py-2 border border-white/20 rounded-md text-gray-300 bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? "Submitting..." : "Submit Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projectSubmissionSuccess && (
        <div className="mt-6 glass-dark border-l-4 border-green-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-300">
                Your project has been successfully submitted! The host will
                review your submission.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonDetails;
