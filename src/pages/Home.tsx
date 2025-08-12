import { Link } from "react-router-dom";
import {
  FaLaptop,
  FaTrophy,
  FaUserPlus,
  FaUsers,
  FaUserTie,
  FaRocket,
  FaStar,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden cyber-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 pt-20 pb-16 sm:pb-24 lg:pb-32">
            <div className="text-center">
              <div className="floating">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
                  <span className="block text-white mb-2">
                    Discover & Participate in
                  </span>
                  <span className="block gradient-text">Global Hackathons</span>
                </h1>
              </div>

              <div className="floating max-w-3xl mx-auto">
                <p className="mt-6 text-xl text-gray-300 leading-relaxed">
                  Join{" "}
                  <span className="gradient-text font-semibold">HackPub</span>,
                  the premier platform for coding competitions and innovation
                  challenges. Connect with developers, showcase your skills, and
                  build the next big thing.
                </p>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  asChild
                  variant="cyber"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  <Link to="/hackathons">
                    <FaRocket className="mr-2" />
                    Explore Hackathons
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="glass"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  <Link to={user ? "/dashboard" : "/register"}>
                    <FaStar className="mr-2" />
                    {user ? "My Dashboard" : "Get Started"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image/Visual */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
          <img
            className="w-full h-full object-cover opacity-10"
            src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
            alt="Coding hackathon"
          />
        </div>
      </div>

      {/* User Role Selection Section (only shown for non-logged in users) */}
      {!user && (
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold neon-blue tracking-wide uppercase mb-4">
              Get Started
            </h2>
            <h3 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Choose Your <span className="gradient-text">Path</span>
            </h3>
            <p className="max-w-2xl mx-auto text-xl text-gray-400 leading-relaxed">
              Register based on your role and start your hackathon journey today
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
            <Card className="card-3d glass-dark group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaUserTie className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-white group-hover:text-blue-400 transition-colors">
                  Host a Hackathon
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Create and manage hackathons, review submissions, and connect
                  with talented participants. Perfect for companies,
                  universities, and organizations looking to foster innovation.
                </p>
                <Button asChild variant="cyber" className="w-full">
                  <Link to="/register?role=host">
                    <FaUserPlus className="mr-2" /> Register as Host
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-3d glass-dark group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaUsers className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-white group-hover:text-purple-400 transition-colors">
                  Join as Participant
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Discover exciting hackathons, form teams, showcase your
                  skills, and compete for prizes. Great for students,
                  professionals, and anyone looking to challenge themselves.
                </p>
                <Button asChild variant="cyber" className="w-full">
                  <Link to="/register?role=participant">
                    <FaUserPlus className="mr-2" /> Register as Participant
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold neon-purple tracking-wide uppercase mb-4">
              Features
            </h2>
            <h3 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Everything you need for{" "}
              <span className="gradient-text">successful hackathons</span>
            </h3>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="card-3d glass-dark group text-center">
              <CardHeader>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaLaptop className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                  Easy Hosting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 leading-relaxed">
                  Seamlessly create and manage hackathons with our intuitive
                  platform designed for organizers.
                </p>
              </CardContent>
            </Card>

            <Card className="card-3d glass-dark group text-center">
              <CardHeader>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaUsers className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                  Team Building
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 leading-relaxed">
                  Connect with like-minded individuals and form powerful teams
                  to tackle challenging problems.
                </p>
              </CardContent>
            </Card>

            <Card className="card-3d glass-dark group text-center">
              <CardHeader>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaTrophy className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white group-hover:text-yellow-400 transition-colors">
                  Compete & Win
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 leading-relaxed">
                  Participate in hackathons with exciting prizes and gain
                  recognition for your innovative solutions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
