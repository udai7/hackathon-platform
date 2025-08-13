import { motion } from "framer-motion";
import { FaStar, FaQuoteLeft, FaUser } from "react-icons/fa";
import { Card, CardContent } from "./ui/card";
import FloatingCard3D from "./FloatingCard3D";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Full Stack Developer",
    company: "TechCorp",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "HackPub made organizing our company hackathon incredibly smooth. The modern interface and seamless payment integration saved us hours of work. Our developers loved the platform!",
  },
  {
    name: "Alex Rodriguez",
    role: "Computer Science Student",
    company: "MIT",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "I've participated in 12 hackathons through HackPub. The dashboard is amazing for tracking all my projects, and the AI evaluation system gives really helpful feedback. Game changer!",
  },
  {
    name: "Dr. Emily Watson",
    role: "Innovation Director",
    company: "StartupHub",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "We've hosted 5 hackathons on HackPub this year. The analytics, participant management, and beautiful UI make it the best platform we've used. Highly recommended!",
  },
  {
    name: "Marcus Johnson",
    role: "Lead Developer",
    company: "InnovateLabs",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "The 3D effects and dark theme make HackPub feel like a premium platform. It's not just functional - it's beautiful. Our team was impressed from day one.",
  },
  {
    name: "Lisa Park",
    role: "Product Manager",
    company: "DevStudio",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Google OAuth integration made registration so easy for our participants. The session management is robust, and we never had any security concerns. Perfect for enterprise use.",
  },
  {
    name: "David Kim",
    role: "Freelance Developer",
    company: "Independent",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "As someone who participates in hackathons regularly, HackPub's user experience is unmatched. The project submission process is smooth, and I love the modern design.",
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-400" : "text-gray-600"
          }`}
        />
      ))}
    </div>
  );
};

const TestimonialCard = ({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0];
  index: number;
}) => {
  return (
    <FloatingCard3D intensity={0.4} className="h-full">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
      >
        <Card className="glass-dark h-full border-2 border-white/10 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-400/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="relative">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget
                        .nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.classList.remove("hidden");
                        fallback.classList.add("flex");
                      }
                    }}
                  />
                ) : null}
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 items-center justify-center hidden">
                  <FaUser className="text-white text-lg" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">{testimonial.name}</h4>
                <p className="text-gray-400 text-sm">{testimonial.role}</p>
                <p className="text-blue-400 text-sm">{testimonial.company}</p>
              </div>
              <StarRating rating={testimonial.rating} />
            </div>

            <div className="relative">
              <FaQuoteLeft className="absolute -top-2 -left-2 text-blue-500/30 text-2xl" />
              <p className="text-gray-300 leading-relaxed pl-6">
                {testimonial.text}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </FloatingCard3D>
  );
};

const Testimonials = () => {
  return (
    <section className="py-20 bg-black cyber-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            What Our <span className="gradient-text">Community</span> Says
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of developers and organizations who trust HackPub for
            their hackathon needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { number: "10K+", label: "Active Users" },
            { number: "500+", label: "Hackathons Hosted" },
            { number: "50K+", label: "Projects Submitted" },
            { number: "99.9%", label: "Uptime" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                {stat.number}
              </div>
              <div className="text-gray-400 text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
