import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get role from URL query params
  const queryParams = new URLSearchParams(location.search);
  const roleFromUrl = queryParams.get("role") || "participant";
  const [role, setRole] = useState(roleFromUrl);

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      await register(name, email, password, role);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create an account");
      console.error(err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 cyber-grid">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <img
            className="h-12 w-auto transition-transform duration-300 hover:scale-110"
            src="/hackpub-logo.png"
            alt="HackPub"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
        <h2 className="text-center text-4xl font-extrabold gradient-text mb-2">
          Join the Community
        </h2>
        <p className="text-center text-gray-400 mb-4">
          Register as a {role === "host" ? "Hackathon Host" : "Participant"}
        </p>
        <p className="text-center text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="card-3d glass-dark">
          <CardHeader>
            <CardTitle className="text-center text-white flex items-center justify-center">
              {role === "host" ? (
                <FaUserTie className="mr-2 text-blue-400" />
              ) : (
                <FaUsers className="mr-2 text-purple-400" />
              )}
              Create Your Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  <FaUser className="inline mr-2" />
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-modern"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  <FaEnvelope className="inline mr-2" />
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-modern"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  <FaLock className="inline mr-2" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="input-modern pr-12"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-400 transition-colors"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Register as
                </label>
                <select
                  id="role"
                  name="role"
                  className="input-modern appearance-none cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option
                    value="participant"
                    className="bg-gray-800 text-white"
                  >
                    🎯 Participant - Join hackathons and compete
                  </option>
                  <option value="host" className="bg-gray-800 text-white">
                    🏆 Host - Organize and manage hackathons
                  </option>
                </select>
              </div>

              <Button
                type="submit"
                variant="cyber"
                className="w-full"
                size="lg"
              >
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
