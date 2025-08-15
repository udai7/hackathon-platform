import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useHackathons } from "../context/HackathonContext";
import { v4 as uuidv4 } from "uuid";
import { Hackathon } from "../types";
import {
  FaUpload,
  FaLink,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaTrophy,
  FaGlobe,
  FaEdit,
  FaPlus,
  FaImage,
} from "react-icons/fa";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

// Available categories for the hackathon
const categories = [
  "AI",
  "Blockchain",
  "Web Development",
  "Mobile",
  "Data Science",
  "Gaming",
  "IoT",
  "Cybersecurity",
  "Environment",
  "Health",
  "Education",
  "Social Impact",
  "Open Innovation",
];

const CreateHackathon = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addHackathon, updateHackathon, allHackathons } = useHackathons();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<
    Omit<Hackathon, "id" | "creatorId" | "featured">
  >({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    organizerName: "",
    category: "",
    location: "",
    image: "",
    prizes: "",
    teamSize: "",
    registrationFee: "",
    website: "",
  });

  const [imageMethod, setImageMethod] = useState<"url" | "upload">("url");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Load existing hackathon data when in edit mode
  useEffect(() => {
    if (isEditMode && allHackathons.length > 0 && user) {
      const hackathon = allHackathons.find((h) => h.id === id);

      if (hackathon) {
        if (hackathon.creatorId !== user.id) {
          navigate("/dashboard");
          return;
        }

        setFormData({
          title: hackathon.title,
          description: hackathon.description,
          startDate: hackathon.startDate,
          endDate: hackathon.endDate,
          registrationDeadline: hackathon.registrationDeadline || "",
          organizerName: hackathon.organizerName || "",
          category: hackathon.category,
          location: hackathon.location || "",
          image: hackathon.image || "",
          prizes: hackathon.prizes || "",
          teamSize: hackathon.teamSize || "",
          registrationFee: hackathon.registrationFee || "",
          website: hackathon.website || "",
        });

        if (hackathon.image && hackathon.image.startsWith("data:image/")) {
          setImageMethod("upload");
          setImagePreview(hackathon.image);
        } else if (hackathon.image) {
          setImageMethod("url");
        }
      } else {
        setNotFound(true);
      }
    }
  }, [isEditMode, id, allHackathons, user, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

    const requiredFields = [
      "title",
      "description",
      "startDate",
      "endDate",
      "category",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() +
          field.slice(1).replace(/([A-Z])/g, " $1")
        } is required`;
      }
    });

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (endDate < startDate) {
        newErrors.endDate = "End date cannot be earlier than start date";
      }
    }

    if (formData.registrationDeadline && formData.startDate) {
      const regDeadline = new Date(formData.registrationDeadline);
      const startDate = new Date(formData.startDate);

      if (regDeadline > startDate) {
        newErrors.registrationDeadline =
          "Registration deadline should be before the start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setFormData((prev) => ({
        ...prev,
        image: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const toggleImageMethod = (method: "url" | "upload") => {
    setImageMethod(method);
    if (method === "url") {
      setImagePreview(null);
      setUploadedImage(null);
    } else {
      if (!imagePreview) {
        setFormData((prev) => ({
          ...prev,
          image: "",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.submit;
      return newErrors;
    });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        const existingHackathon = allHackathons.find((h) => h.id === id);

        if (!existingHackathon) {
          throw new Error("Hackathon not found");
        }

        const updatedHackathon: Hackathon = {
          ...existingHackathon,
          ...formData,
        };

        await updateHackathon(updatedHackathon);
      } else {
        const newHackathon: Hackathon = {
          ...formData,
          id: uuidv4(),
          creatorId: user?.id || "",
          featured: false,
        };

        await addHackathon(newHackathon);
      }

      setSubmissionComplete(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Submission error:", error);

      let errorMessage = "Unknown error occurred";

      if (
        error.message.includes("Network Error") ||
        error.message.includes("connect") ||
        error.message.includes("timeout") ||
        error.message.includes("server")
      ) {
        errorMessage = `Network error: ${error.message}. Please check your connection and try again.`;
      } else if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
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

  if (notFound) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="glass-dark text-center py-16">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center">
                  <FaEdit className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Hackathon Not Found
                </h2>
                <p className="text-gray-400 mb-8">
                  The hackathon you're trying to edit doesn't exist.
                </p>
                <Button asChild variant="cyber">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {submissionComplete ? (
          <Card className="glass-dark text-center py-16">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {isEditMode ? "Hackathon Updated!" : "Hackathon Created!"}
                </h2>
                <p className="text-gray-400 mb-8">
                  Your hackathon has been successfully{" "}
                  {isEditMode ? "updated" : "created"} and is now live.
                </p>
                <Button asChild variant="cyber">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <Card className="glass-dark mb-8">
              <CardHeader>
                <CardTitle className="text-center text-white flex items-center justify-center text-3xl">
                  {isEditMode ? (
                    <>
                      <FaEdit className="mr-3 text-blue-400" />
                      Edit Hackathon
                    </>
                  ) : (
                    <>
                      <FaPlus className="mr-3 text-green-400" />
                      Create a Hackathon
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="card-3d glass-dark no-hover border-2 border-white/10 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-400/20 transition-all duration-300">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit}>
                  {errors.submit && (
                    <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                      <p className="font-medium">{errors.submit}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Title */}
                    <div className="col-span-1 md:col-span-2">
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        <FaEdit className="inline mr-2" />
                        Hackathon Title*
                      </label>
                      <Input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`input-modern ${
                          errors.title ? "border-red-500" : ""
                        }`}
                        placeholder="Enter hackathon title"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        <FaTrophy className="inline mr-2" />
                        Category*
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={`input-modern ${
                          errors.category ? "border-red-500" : ""
                        }`}
                      >
                        <option value="" className="bg-gray-800 text-white">
                          Select a category
                        </option>
                        {categories.map((category) => (
                          <option
                            key={category}
                            value={category}
                            className="bg-gray-800 text-white"
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.category}
                        </p>
                      )}
                    </div>

                    {/* Start Date */}
                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        <FaCalendarAlt className="inline mr-2 text-blue-400" />
                        Start Date*
                      </label>
                      <Input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className={`input-modern ${
                          errors.startDate ? "border-red-500" : ""
                        }`}
                      />
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.startDate}
                        </p>
                      )}
                    </div>

                    {/* End Date */}
                    <div>
                      <label
                        htmlFor="endDate"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        <FaCalendarAlt className="inline mr-2 text-blue-400" />
                        End Date*
                      </label>
                      <Input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className={`input-modern ${
                          errors.endDate ? "border-red-500" : ""
                        }`}
                      />
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.endDate}
                        </p>
                      )}
                    </div>

                    {/* Registration Deadline */}
                    <div>
                      <label
                        htmlFor="registrationDeadline"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        <FaCalendarAlt className="inline mr-2 text-blue-400" />
                        Registration Deadline
                      </label>
                      <Input
                        type="date"
                        id="registrationDeadline"
                        name="registrationDeadline"
                        value={formData.registrationDeadline}
                        onChange={handleChange}
                        className={`input-modern ${
                          errors.registrationDeadline ? "border-red-500" : ""
                        }`}
                      />
                      {errors.registrationDeadline && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.registrationDeadline}
                        </p>
                      )}
                    </div>

                    {/* Organizer Name */}
                    <div>
                      <label
                        htmlFor="organizerName"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        <FaUsers className="inline mr-2" />
                        Organizer Name
                      </label>
                      <Input
                        type="text"
                        id="organizerName"
                        name="organizerName"
                        value={formData.organizerName}
                        onChange={handleChange}
                        className="input-modern"
                        placeholder="Name of organizing company/institution"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        <FaMapMarkerAlt className="inline mr-2" />
                        Location
                      </label>
                      <Input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="input-modern"
                        placeholder="City, Country or 'Online'"
                      />
                    </div>

                    {/* Team Size */}
                    <div>
                      <label
                        htmlFor="teamSize"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        <FaUsers className="inline mr-2" />
                        Team Size
                      </label>
                      <Input
                        type="text"
                        id="teamSize"
                        name="teamSize"
                        value={formData.teamSize}
                        onChange={handleChange}
                        className="input-modern"
                        placeholder="e.g. '1-4 members'"
                      />
                    </div>

                    {/* Prizes */}
                    <div>
                      <label
                        htmlFor="prizes"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        <FaTrophy className="inline mr-2" />
                        Prizes
                      </label>
                      <Input
                        type="text"
                        id="prizes"
                        name="prizes"
                        value={formData.prizes}
                        onChange={handleChange}
                        className="input-modern"
                        placeholder="e.g. '₹50,000 in prizes'"
                      />
                    </div>

                    {/* Registration Fee */}
                    <div>
                      <label
                        htmlFor="registrationFee"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Registration Fee
                      </label>
                      <Input
                        type="text"
                        id="registrationFee"
                        name="registrationFee"
                        value={formData.registrationFee}
                        onChange={handleChange}
                        className="input-modern"
                        placeholder="e.g. 'Free' or '₹500'"
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <label
                        htmlFor="website"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        <FaGlobe className="inline mr-2" />
                        Website
                      </label>
                      <Input
                        type="text"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="input-modern"
                        placeholder="e.g. 'https://hackathon.com'"
                      />
                    </div>

                    {/* Image Source */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <FaImage className="inline mr-2" />
                        Hackathon Image
                      </label>
                      <div className="flex space-x-4 mb-3">
                        <Button
                          type="button"
                          onClick={() => toggleImageMethod("url")}
                          variant={imageMethod === "url" ? "cyber" : "glass"}
                          size="sm"
                        >
                          <FaLink className="mr-2" /> URL
                        </Button>
                        <Button
                          type="button"
                          onClick={() => toggleImageMethod("upload")}
                          variant={imageMethod === "upload" ? "cyber" : "glass"}
                          size="sm"
                        >
                          <FaUpload className="mr-2" /> Upload
                        </Button>
                      </div>

                      {imageMethod === "url" ? (
                        <Input
                          type="text"
                          id="image"
                          name="image"
                          value={formData.image}
                          onChange={handleChange}
                          className="input-modern"
                          placeholder="URL to hackathon banner image"
                        />
                      ) : (
                        <div>
                          <div className="flex items-center">
                            <input
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              variant="glass"
                              size="sm"
                            >
                              Choose File
                            </Button>
                            <span className="ml-3 text-sm text-gray-400">
                              {uploadedImage
                                ? uploadedImage.name
                                : "No file chosen"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Image Preview */}
                      {(imagePreview || formData.image) && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-400 mb-2">Preview:</p>
                          <img
                            src={
                              imageMethod === "upload"
                                ? imagePreview || formData.image
                                : formData.image
                            }
                            alt="Hackathon banner preview"
                            className="max-h-40 border border-gray-700 rounded-md shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              setErrors((prev) => ({
                                ...prev,
                                image:
                                  "Failed to load image. Please check the URL.",
                              }));
                            }}
                            onLoad={(e) => {
                              e.currentTarget.style.display = "block";
                              if (errors.image) {
                                setErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.image;
                                  return newErrors;
                                });
                              }
                            }}
                          />
                          {errors.image && (
                            <p className="mt-1 text-sm text-red-400">
                              {errors.image}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Description*
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      className={`input-modern resize-none ${
                        errors.description ? "border-red-500" : ""
                      }`}
                      placeholder="Describe your hackathon..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 mt-8">
                    <Button asChild variant="glass">
                      <Link to="/dashboard">Cancel</Link>
                    </Button>
                    <Button
                      type="submit"
                      variant="cyber"
                      disabled={isSubmitting}
                      className="min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="loading-spinner mr-2 w-4 h-4"></div>
                          {isEditMode ? "Updating..." : "Creating..."}
                        </div>
                      ) : isEditMode ? (
                        "Update Hackathon"
                      ) : (
                        "Create Hackathon"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateHackathon;
