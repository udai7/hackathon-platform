export interface Hackathon {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  organizerName: string;
  category: string;
  location: string;
  image: string;
  prizes: string;
  teamSize: string;
  registrationFee: string;
  website: string;
  creatorId: string;
  featured: boolean;
  participants?: Participant[];
  upiId?: string;
  paymentRequired?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "host" | "participant" | "admin";
  avatar?: string;
  provider?: "local" | "google";
  createdAt?: string;
}

export interface Payment {
  id: string;
  participantId: string;
  hackathonId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  orderId: string;
  paymentId?: string;
  receiptId: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  university?: string;
  skills?: string[];
  experience?: string;
  teamName?: string;
  teammates?: string[];
  submissionDate: string;
  status: "pending" | "approved" | "rejected" | "enrolled";
  paymentStatus?: "pending" | "completed" | "failed" | "not_required";
  paymentId?: string;
  hackathonPaymentRequired?: boolean;
  upiId?: string;
  projectSubmission?: {
    githubLink: string;
    projectDescription: string;
    submissionDate: Date;
    evaluation?: {
      score: number;
      feedback: string;
      metrics: {
        innovation: number;
        technicalComplexity: number;
        codeQuality: number;
        userExperience: number;
        documentation: number;
        scalability: number;
        maintainability: number;
      };
      strengths: string[];
      areasForImprovement: string[];
      recommendations: string[];
      evaluatedBy: string;
      evaluatedAt: Date;
    };
    ranking?: {
      rank: number;
      score: number;
      feedback: string;
      rankedAt: Date;
    };
  };
}
