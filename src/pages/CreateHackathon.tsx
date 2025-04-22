import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHackathons } from '../context/HackathonContext';
import { v4 as uuidv4 } from 'uuid';
import { Hackathon } from '../types';
import { FaUpload, FaLink } from 'react-icons/fa';

// Available categories for the hackathon
const categories = ['AI', 'Blockchain', 'Web Development', 'Mobile', 'Data Science', 'Gaming', 'IoT', 'Cybersecurity', 'Environment', 'Health', 'Education', 'Social Impact', 'Open Innovation'];

const CreateHackathon = () => {
  console.log('CreateHackathon component rendering');
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addHackathon, updateHackathon, allHackathons } = useHackathons();
  const isEditMode = !!id;
  
  console.log('Current route params:', { id, isEditMode });
  
  const [formData, setFormData] = useState<Omit<Hackathon, 'id' | 'creatorId' | 'featured'>>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    organizerName: '',
    category: '',
    location: '',
    image: '',
    prizes: '',
    teamSize: '',
    registrationFee: '',
    website: ''
  });
  
  // Add new state variables for image handling
  const [imageMethod, setImageMethod] = useState<'url' | 'upload'>('url');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // Redirect if not logged in - moved after all hook declarations
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Load existing hackathon data when in edit mode
  useEffect(() => {
    if (isEditMode) {
      console.log('Edit mode detected, id:', id);
      console.log('Available hackathons:', allHackathons);
      
      if (allHackathons.length > 0 && user) {
        const hackathon = allHackathons.find(h => h.id === id);
        console.log('Found hackathon:', hackathon);
        
        if (hackathon) {
          // Check if user is the creator
          if (hackathon.creatorId !== user.id) {
            console.log('User is not the creator, redirecting');
            navigate('/dashboard');
            return;
          }
          
          // Fill form with existing data
          console.log('Setting form data for editing');
          setFormData({
            title: hackathon.title,
            description: hackathon.description,
            startDate: hackathon.startDate,
            endDate: hackathon.endDate,
            registrationDeadline: hackathon.registrationDeadline || '',
            organizerName: hackathon.organizerName || '',
            category: hackathon.category,
            location: hackathon.location || '',
            image: hackathon.image || '',
            prizes: hackathon.prizes || '',
            teamSize: hackathon.teamSize || '',
            registrationFee: hackathon.registrationFee || '',
            website: hackathon.website || ''
          });
          
          // Check if the image is a data URL (from a previous upload)
          if (hackathon.image && hackathon.image.startsWith('data:image/')) {
            setImageMethod('upload');
            setImagePreview(hackathon.image);
            // We can't recover the original File object, but we can show the preview
          } else if (hackathon.image) {
            setImageMethod('url');
          }
        } else {
          console.log('Hackathon not found, setting notFound state');
          setNotFound(true);
        }
      }
    }
  }, [isEditMode, id, allHackathons, user, navigate]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    const requiredFields = ['title', 'description', 'startDate', 'endDate', 'category'];
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });
    
    // Date validation
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate < startDate) {
        newErrors.endDate = 'End date cannot be earlier than start date';
      }
    }
    
    if (formData.registrationDeadline && formData.startDate) {
      const regDeadline = new Date(formData.registrationDeadline);
      const startDate = new Date(formData.startDate);
      
      if (regDeadline > startDate) {
        newErrors.registrationDeadline = 'Registration deadline should be before the start date';
      }
    }
    
    // Image validation
    if (imageMethod === 'upload' && uploadedImage) {
      // Check image size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (uploadedImage.size > maxSize) {
        newErrors.image = 'Image size should be less than 2MB';
      }
      
      // Check image type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(uploadedImage.type)) {
        newErrors.image = 'Only JPEG, PNG, GIF, and WebP images are allowed';
      }
    }
    
    // If URL is used but empty, add a note (not an error)
    if (imageMethod === 'url' && !formData.image) {
      console.log('No image URL provided, a default image will be used');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add a function to handle image file selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedImage(file);
    
    // Create a preview URL for the uploaded image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      // Set the form data image field to the data URL for immediate use
      setFormData(prev => ({
        ...prev,
        image: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  // Add a function to handle the image method toggle
  const toggleImageMethod = (method: 'url' | 'upload') => {
    setImageMethod(method);
    if (method === 'url') {
      // Clear uploaded image data when switching to URL
      setImagePreview(null);
      setUploadedImage(null);
      // Keep the URL value if it exists
    } else {
      // When switching to upload, keep the preview if it exists
      // or clear the image URL if no preview 
      if (!imagePreview) {
        setFormData(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission attempt, current data:', {
      ...formData,
      image: formData.image?.substring(0, 50) + (formData.image?.length > 50 ? '... [truncated]' : '')
    });
    
    // Clear any previous submission errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.submit;
      return newErrors;
    });
    
    // Check if image data URL is too large
    if (formData.image && formData.image.startsWith('data:image/') && formData.image.length > 1000000) {
      console.warn('Image data URL is very large:', (formData.image.length / 1000000).toFixed(2) + ' MB');
      
      // Compress the image if it's too large
      try {
        const compressedImage = await compressImageDataUrl(formData.image);
        console.log('Compressed image from', formData.image.length, 'to', compressedImage.length, 'bytes');
        
        // Update form data with compressed image
        setFormData(prev => ({
          ...prev,
          image: compressedImage
        }));
      } catch (err) {
        console.error('Error compressing image:', err);
        setErrors(prev => ({
          ...prev,
          image: 'Image is too large. Please choose a smaller image or reduce its size.'
        }));
        return;
      }
    }
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        // Get the existing hackathon to preserve participants and other data
        const existingHackathon = allHackathons.find(h => h.id === id);
        
        if (!existingHackathon) {
          throw new Error('Hackathon not found');
        }
        
        // Update the hackathon with new form data while preserving other fields
        const updatedHackathon: Hackathon = {
          ...existingHackathon,
          ...formData,
        };
        
        // Update in context
        await updateHackathon(updatedHackathon);
      } else {
        // Create a new hackathon
        const newHackathon: Hackathon = {
          ...formData,
          id: uuidv4(),
          creatorId: user?.id || '',
          featured: false
        };
        
        console.log('Creating new hackathon with data:', {
          ...newHackathon,
          image: newHackathon.image?.substring(0, 50) + (newHackathon.image?.length > 50 ? '... [truncated]' : '')
        });
        
        // Add to context
        await addHackathon(newHackathon);
      }
      
      setSubmissionComplete(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Submission error:', error);
      
      // Determine error message with specifics for network errors
      let errorMessage = 'Unknown error occurred';
      
      if (error.message.includes('Network Error') || 
          error.message.includes('connect') || 
          error.message.includes('timeout') ||
          error.message.includes('server')) {
        errorMessage = `Network error: ${error.message}. Please check your connection and try again.`;
        console.error('Network error details:', error);
      } else if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Error details:', errorMessage);
      
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
      
      // Scroll to the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a utility function to compress images
  const compressImageDataUrl = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Calculate new dimensions (max width/height of 800px)
        let width = img.width;
        let height = img.height;
        const maxDimension = 800;
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get the compressed data URL (0.8 quality)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = dataUrl;
    });
  };

  // If user is not logged in, a useEffect will redirect, so just show loading
  if (!user) {
    return (
      <div className="w-full flex-grow bg-gray-50 py-8 px-4 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-full flex-grow bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-10 bg-white rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Hackathon Not Found</h2>
          <p className="text-xl text-gray-600 mb-6">The hackathon you're trying to edit doesn't exist.</p>
          <Link to="/dashboard" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-grow bg-gray-50 py-8 px-4">
      {submissionComplete ? (
        <div className="max-w-4xl mx-auto text-center py-10 bg-white rounded-lg shadow-md">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-gray-900">
            {isEditMode ? 'Hackathon Updated!' : 'Hackathon Created!'}
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Your hackathon has been successfully {isEditMode ? 'updated' : 'created'} and is now live.
          </p>
          <Link to="/dashboard" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="bg-indigo-600 rounded-t-lg py-4 px-6">
            <h1 className="text-3xl font-bold text-white">
              {isEditMode ? 'Edit Hackathon' : 'Create a Hackathon'}
            </h1>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-b-lg shadow-md">
            {errors.submit && (
              <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md border border-red-200">
                <p className="font-medium">{errors.submit}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Title */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Hackathon Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black`}
                  placeholder="Enter hackathon title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>
              
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black`}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>
              
              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date*
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.startDate ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
              </div>
              
              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date*
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.endDate ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
              </div>
              
              {/* Registration Deadline */}
              <div>
                <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Deadline
                </label>
                <input
                  type="date"
                  id="registrationDeadline"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.registrationDeadline ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black`}
                />
                {errors.registrationDeadline && <p className="mt-1 text-sm text-red-500">{errors.registrationDeadline}</p>}
              </div>
              
              {/* Organizer Name */}
              <div>
                <label htmlFor="organizerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Organizer Name
                </label>
                <input
                  type="text"
                  id="organizerName"
                  name="organizerName"
                  value={formData.organizerName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                  placeholder="Name of organizing company/institution"
                />
              </div>
              
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                  placeholder="City, Country or 'Online'"
                />
              </div>
              
              {/* Image Source */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hackathon Image
                </label>
                <div className="flex space-x-4 mb-3">
                  <button
                    type="button"
                    onClick={() => toggleImageMethod('url')}
                    className={`flex items-center px-3 py-2 border rounded ${
                      imageMethod === 'url' 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                      : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <FaLink className="mr-2" /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleImageMethod('upload')}
                    className={`flex items-center px-3 py-2 border rounded ${
                      imageMethod === 'upload' 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                      : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <FaUpload className="mr-2" /> Upload
                  </button>
                </div>
                
                {imageMethod === 'url' ? (
                  <div>
                    <input
                      type="text"
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                      placeholder="URL to hackathon banner image"
                    />
                  </div>
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
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black hover:bg-gray-50"
                      >
                        Choose File
                      </button>
                      <span className="ml-3 text-sm text-gray-500">
                        {uploadedImage ? uploadedImage.name : 'No file chosen'}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Image Preview */}
                {(imagePreview || formData.image) && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Preview:</p>
                    <img 
                      src={imageMethod === 'upload' ? (imagePreview || formData.image) : formData.image} 
                      alt="Hackathon banner preview" 
                      className="max-h-40 border rounded-md shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        setErrors(prev => ({
                          ...prev,
                          image: 'Failed to load image. Please check the URL.'
                        }));
                      }}
                      onLoad={(e) => {
                        e.currentTarget.style.display = 'block';
                        // Clear any previous image errors
                        if (errors.image) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.image;
                            return newErrors;
                          });
                        }
                      }}
                    />
                    {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
                  </div>
                )}
              </div>
              
              {/* Team Size */}
              <div>
                <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Size
                </label>
                <input
                  type="text"
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                  placeholder="e.g. '1-4 members'"
                />
              </div>
              
              {/* Prizes */}
              <div>
                <label htmlFor="prizes" className="block text-sm font-medium text-gray-700 mb-1">
                  Prizes
                </label>
                <input
                  type="text"
                  id="prizes"
                  name="prizes"
                  value={formData.prizes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                  placeholder="e.g. '₹50,000 in prizes'"
                />
              </div>
              
              {/* Registration Fee */}
              <div>
                <label htmlFor="registrationFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Fee
                </label>
                <input
                  type="text"
                  id="registrationFee"
                  name="registrationFee"
                  value={formData.registrationFee}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                  placeholder="e.g. 'Free' or '₹500'"
                />
              </div>
              
              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
                  placeholder="e.g. 'https://hackathon.com'"
                />
              </div>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black`}
                placeholder="Describe your hackathon..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>
            
            <div className="col-span-1 md:col-span-2 flex justify-end mt-6">
              <Link
                to="/dashboard"
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-md transition shadow-sm mr-3 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition shadow-sm ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEditMode ? 'Update Hackathon' : 'Create Hackathon'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateHackathon; 