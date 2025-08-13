import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";
import { Card, CardContent } from "./ui/card";

const faqData = [
  {
    question: "How do I create a hackathon on HackPub?",
    answer:
      "Simply sign up as a host, navigate to your dashboard, and click 'Create New Hackathon'. Fill in the details like title, description, dates, and prizes. You can also set registration fees and manage participants.",
  },
  {
    question: "Is HackPub free to use?",
    answer:
      "Yes! HackPub is completely free for participants. Hosts can create hackathons for free, and only pay optional fees if they want premium features or payment processing for registration fees.",
  },
  {
    question: "Can I participate in multiple hackathons?",
    answer:
      "Absolutely! You can join as many hackathons as you want. Your dashboard will show all your active and past participations, making it easy to track your hackathon journey.",
  },
  {
    question: "How does the payment system work?",
    answer:
      "We use Razorpay for secure payment processing. If a hackathon has a registration fee, you can pay safely through our platform. Hosts receive payments directly to their accounts.",
  },
  {
    question: "Can I form teams for hackathons?",
    answer:
      "Yes! Most hackathons support team participation. You can specify team size requirements when creating a hackathon, and participants can register as teams or find teammates through our platform.",
  },
  {
    question: "What happens after I submit my project?",
    answer:
      "Once you submit your project, it goes through our AI-powered evaluation system using Google Gemini. Judges can also manually review submissions. Results are announced according to the hackathon timeline.",
  },
  {
    question: "How do I get notified about new hackathons?",
    answer:
      "Enable notifications in your profile settings. We'll send you updates about new hackathons matching your interests, registration deadlines, and important announcements.",
  },
  {
    question: "Can I edit my hackathon after publishing?",
    answer:
      "Yes, hosts can edit their hackathons anytime before the registration deadline. You can update descriptions, dates, prizes, and other details from your dashboard.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <FaQuestionCircle className="text-4xl text-blue-400 mr-3" />
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about HackPub and how it works
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <Card key={index} className="glass-dark border-gray-700/50">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaChevronDown className="text-blue-400 flex-shrink-0" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0">
                        <div className="h-px bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-4" />
                        <p className="text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
