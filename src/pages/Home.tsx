import { Link } from 'react-router-dom';
import { FaCode, FaLaptop, FaTrophy, FaUserPlus, FaUsers, FaUserTie } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-gray-50 transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>
            <div className="pt-10 sm:pt-16 lg:pt-8 xl:pt-16">
              <div className="sm:text-center lg:text-left px-4 sm:px-8 xl:pr-16">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Discover & Participate in</span>
                  <span className="block text-indigo-600">Global Hackathons</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0">
                  Join HackPub, the premier platform for coding competitions and innovation challenges.
                  Connect with developers, showcase your skills, and build the next big thing.
                </p>
                <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/hackathons"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                    >
                      Explore Hackathons
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to={user ? "/dashboard" : "/register"}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                    >
                      {user ? "My Dashboard" : "Get Started"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
            alt="Coding hackathon"
          />
        </div>
      </div>

      {/* User Role Selection Section (only shown for non-logged in users) */}
      {!user && (
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Get Started</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Choose Your Path
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Register based on your role and start your hackathon journey today
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
                  <FaUserTie className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">Host a Hackathon</h3>
                <p className="mt-2 text-sm text-gray-500 h-24">
                  Create and manage hackathons, review submissions, and connect with talented participants.
                  Perfect for companies, universities, and organizations looking to foster innovation.
                </p>
                <div className="mt-5">
                  <Link
                    to="/register?role=host"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FaUserPlus className="mr-2" /> Register as Host
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
                  <FaUsers className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">Join as Participant</h3>
                <p className="mt-2 text-sm text-gray-500 h-24">
                  Discover exciting hackathons, form teams, showcase your skills, and compete for prizes.
                  Great for students, professionals, and anyone looking to challenge themselves.
                </p>
                <div className="mt-5">
                  <Link
                    to="/register?role=participant"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FaUserPlus className="mr-2" /> Register as Participant
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for successful hackathons
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <FaLaptop className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900 text-center">Easy Hosting</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Seamlessly create and manage hackathons with our intuitive platform designed for organizers.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <FaUsers className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900 text-center">Team Building</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Connect with like-minded individuals and form powerful teams to tackle challenging problems.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <FaTrophy className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900 text-center">Compete & Win</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Participate in hackathons with exciting prizes and gain recognition for your innovative solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 