import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaLaptop,
  FaTrophy,
  FaUserPlus,
  FaUsers,
  FaUserTie,
  FaRocket,
  FaStar,
  FaArrowDown,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import FAQ from "../components/FAQ";
import Testimonials from "../components/Testimonials";
import FloatingCard3D from "../components/FloatingCard3D";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden cyber-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 pt-20 pb-16 sm:pb-24 lg:pb-32">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="floating"
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
                  <span className="block text-white mb-2">
                    Discover & Participate in
                  </span>
                  <span className="block gradient-text">Global Hackathons</span>
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="floating max-w-3xl mx-auto"
              >
                <p className="mt-6 text-xl text-gray-300 leading-relaxed">
                  Join <span className="text-white font-semibold">HackPub</span>
                  , the premier platform for coding competitions and innovation
                  challenges. Connect with developers, showcase your skills, and
                  build the next big thing.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
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
              </motion.div>

              {/* Scroll Down Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="mt-16"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex flex-col items-center text-gray-400"
                >
                  <span className="text-sm mb-2">Scroll to explore</span>
                  <FaArrowDown className="text-lg" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40" />
          <img
            className="w-full h-full object-cover opacity-5"
            src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
            alt="Coding hackathon"
          />
        </div>
      </div>

      {/* Choose Your Path Section - Enhanced with 3D Effects */}
      {!user && (
        <section className="relative py-32 bg-black cyber-grid">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <span className="text-sm font-semibold text-white tracking-wide uppercase">
                  🚀 Get Started
                </span>
              </div>
              <h2 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
                Choose Your <span className="text-white">Path</span>
              </h2>
              <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
              <p className="max-w-2xl mx-auto text-xl text-gray-400 leading-relaxed">
                Register based on your role and start your hackathon journey
                today
              </p>
            </motion.div>

            <div className="grid gap-12 lg:grid-cols-2 max-w-6xl mx-auto">
              <FloatingCard3D className="h-full" intensity={0.6}>
                <Card className="card-3d glass-dark group h-full border-2 border-white/10 hover:border-white/30 transition-all duration-300">
                  <CardHeader className="text-center pb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-white text-black mb-6 shadow-2xl"
                    >
                      <FaUserTie className="h-12 w-12" />
                    </motion.div>
                    <CardTitle className="text-3xl text-white group-hover:text-gray-200 transition-colors">
                      🏆 Host a Hackathon
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center px-8">
                    <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                      Create and manage hackathons, review submissions, and
                      connect with talented participants. Perfect for companies,
                      universities, and organizations looking to foster
                      innovation.
                    </p>
                    <Button
                      asChild
                      variant="default"
                      className="w-full bg-white text-black hover:bg-gray-100 text-lg py-3"
                    >
                      <Link to="/register?role=host">
                        <FaUserPlus className="mr-2" /> Register as Host
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </FloatingCard3D>

              <FloatingCard3D className="h-full" intensity={0.6}>
                <Card className="card-3d glass-dark group h-full border-2 border-white/10 hover:border-white/30 transition-all duration-300">
                  <CardHeader className="text-center pb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-white text-black mb-6 shadow-2xl"
                    >
                      <FaUsers className="h-12 w-12" />
                    </motion.div>
                    <CardTitle className="text-3xl text-white group-hover:text-gray-200 transition-colors">
                      🎯 Join as Participant
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center px-8">
                    <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                      Discover exciting hackathons, form teams, showcase your
                      skills, and compete for prizes. Great for students,
                      professionals, and anyone looking to challenge themselves.
                    </p>
                    <Button
                      asChild
                      variant="default"
                      className="w-full bg-white text-black hover:bg-gray-100 text-lg py-3"
                    >
                      <Link to="/register?role=participant">
                        <FaUserPlus className="mr-2" /> Register as Participant
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </FloatingCard3D>
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Enhanced with Clear Distinction */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <span className="text-sm font-semibold text-white tracking-wide uppercase">
                ⚡ Features
              </span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
              Everything you need for{" "}
              <span className="text-white">successful hackathons</span>
            </h2>
            <div className="w-32 h-1 bg-white mx-auto mb-6"></div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Powerful tools and features designed to make your hackathon
              experience seamless and successful
            </p>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-3">
            <FloatingCard3D intensity={0.5}>
              <Card className="card-3d glass-dark group text-center h-full border-2 border-white/10 hover:border-white/30 transition-all duration-300">
                <CardHeader className="pb-6">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-white text-black mb-6 shadow-2xl"
                  >
                    <FaLaptop className="h-10 w-10" />
                  </motion.div>
                  <CardTitle className="text-2xl text-white group-hover:text-gray-200 transition-colors">
                    💻 Easy Hosting
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Seamlessly create and manage hackathons with our intuitive
                    platform designed for organizers.
                  </p>
                </CardContent>
              </Card>
            </FloatingCard3D>

            <FloatingCard3D intensity={0.5}>
              <Card className="card-3d glass-dark group text-center h-full border-2 border-white/10 hover:border-white/30 transition-all duration-300">
                <CardHeader className="pb-6">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: -10 }}
                    className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-white text-black mb-6 shadow-2xl"
                  >
                    <FaUsers className="h-10 w-10" />
                  </motion.div>
                  <CardTitle className="text-2xl text-white group-hover:text-gray-200 transition-colors">
                    👥 Team Building
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Connect with like-minded individuals and form powerful teams
                    to tackle challenging problems.
                  </p>
                </CardContent>
              </Card>
            </FloatingCard3D>

            <FloatingCard3D intensity={0.5}>
              <Card className="card-3d glass-dark group text-center h-full border-2 border-white/10 hover:border-white/30 transition-all duration-300">
                <CardHeader className="pb-6">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-white text-black mb-6 shadow-2xl"
                  >
                    <FaTrophy className="h-10 w-10" />
                  </motion.div>
                  <CardTitle className="text-2xl text-white group-hover:text-gray-200 transition-colors">
                    🏆 Compete & Win
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <p className="text-gray-300 leading-relaxed text-lg">
                    Participate in hackathons with exciting prizes and gain
                    recognition for your innovative solutions.
                  </p>
                </CardContent>
              </Card>
            </FloatingCard3D>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
};

export default Home;
