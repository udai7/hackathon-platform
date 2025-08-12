import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaGithub, FaCheck } from "react-icons/fa";
import axios from "axios";

// Sample hackathon data (in a real app this would come from an API)
// const hackathonsData = [
// ];

interface FormData {
  projectDescription: string;
  githubLink: string;
}

interface Hackathon {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  organizerName: string;
}

const SubmitProject = () => {
  const { hackathonId, participantId } = useParams<{
    hackathonId: string;
    participantId: string;
  }>();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    projectDescription: "",
    githubLink: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchHackathonDetails = async () => {
      try {
        const response = await axios.get(`/api/hackathons/${hackathonId}`);
        setHackathon(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load hackathon details");
        setLoading(false);
      }
    };

    if (hackathonId) {
      fetchHackathonDetails();
    }
  }, [hackathonId]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.githubLink.trim()) {
      newErrors.githubLink = "GitHub link is required";
    } else if (!formData.githubLink.includes("github.com")) {
      newErrors.githubLink = "Please enter a valid GitHub repository link";
    }

    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = "Project description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(`/api/hackathons/${hackathonId}/submit-project`, {
        participantId,
        githubLink: formData.githubLink,
        projectDescription: formData.projectDescription,
      });

      setSubmitted(true);
      setTimeout(() => {
        navigate(`/dashboard`);
      }, 2000);
    } catch (err) {
      setError("Failed to submit project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center text-red-600">Hackathon not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">
            Submit Project for {hackathon.title}
          </h1>

          {submitted ? (
            <div className="text-center py-8">
              <FaCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Project Submitted Successfully!
              </h2>
              <p className="text-gray-600">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="githubLink"
                  className="block text-sm font-medium text-gray-700"
                >
                  GitHub Repository Link
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGithub className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    name="githubLink"
                    id="githubLink"
                    value={formData.githubLink}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.githubLink ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="https://github.com/username/repository"
                  />
                </div>
                {errors.githubLink && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.githubLink}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="projectDescription"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project Description
                </label>
                <div className="mt-1">
                  <textarea
                    name="projectDescription"
                    id="projectDescription"
                    rows={4}
                    value={formData.projectDescription}
                    onChange={handleChange}
                    className={`block w-full border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.projectDescription
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Describe your project, its features, and how it solves the problem..."
                  />
                </div>
                {errors.projectDescription && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.projectDescription}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Project"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitProject;
