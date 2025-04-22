import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const EditHackathon = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No hackathon ID provided");
      return;
    }

    try {
      // Redirect to the create hackathon page with the ID for editing
      navigate(`/create-hackathon/${id}`, { replace: true });
    } catch (err) {
      console.error("Navigation error:", err);
      setError("Failed to navigate to edit page");
    }
  }, [id, navigate]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 mb-4">
          <p>{error}</p>
        </div>
        <Link to="/dashboard" className="text-indigo-600 hover:underline">
          Return to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4">Redirecting to edit hackathon form...</p>
    </div>
  );
};

export default EditHackathon; 