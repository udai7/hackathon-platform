import { Hackathon, Participant } from "../types";
import api from "./api";
import { AxiosError } from "axios";

// Get all hackathons
export const getAllHackathons = async (): Promise<Hackathon[]> => {
  try {
    const response = await api.get("/hackathons");
    return response.data;
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    throw error;
  }
};

// Get featured hackathons
export const getFeaturedHackathons = async (): Promise<Hackathon[]> => {
  try {
    const response = await api.get("/hackathons/featured");
    return response.data;
  } catch (error) {
    console.error("Error fetching featured hackathons:", error);
    throw error;
  }
};

// Get hackathons by creator ID
export const getHackathonsByCreator = async (
  creatorId: string
): Promise<Hackathon[]> => {
  try {
    const response = await api.get(`/hackathons/creator/${creatorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching hackathons for creator ${creatorId}:`, error);
    throw error;
  }
};

// Get a single hackathon by ID
export const getHackathonById = async (
  id: string
): Promise<Hackathon | null> => {
  try {
    const response = await api.get(`/hackathons/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    console.error(`Error fetching hackathon with ID ${id}:`, error);
    throw error;
  }
};

// Create a new hackathon
export const createHackathon = async (
  hackathon: Hackathon
): Promise<Hackathon> => {
  try {
    const response = await api.post("/hackathons", hackathon);
    return response.data;
  } catch (error) {
    console.error("Error creating hackathon:", error);
    throw error;
  }
};

// Update an existing hackathon
export const updateHackathon = async (
  hackathon: Hackathon
): Promise<Hackathon | null> => {
  try {
    const response = await api.put(`/hackathons/${hackathon.id}`, hackathon);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    console.error(`Error updating hackathon with ID ${hackathon.id}:`, error);
    throw error;
  }
};

// Delete a hackathon
export const deleteHackathon = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/hackathons/${id}`);
    return true;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return false;
    }
    console.error(`Error deleting hackathon with ID ${id}:`, error);
    throw error;
  }
};

// Register a participant for a hackathon
export const registerParticipant = async (
  hackathonId: string,
  participant: Participant
): Promise<any> => {
  try {
    const response = await api.post(
      `/hackathons/${hackathonId}/participants`,
      participant
    );
    return response.data;
  } catch (error) {
    console.error("Error registering participant:", error);
    throw error;
  }
};

// Create a payment order for hackathon registration
export const createPaymentOrder = async (
  hackathonId: string,
  participantId: string,
  amount: number
): Promise<any> => {
  try {
    const response = await api.post(
      `/payments/create/${hackathonId}/${participantId}`,
      { amount }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating payment order:", error);

    // Handle specific error responses from the server
    if (error.response) {
      const { status, data } = error.response;

      if (status === 503) {
        console.log("Payment service unavailable - in fallback mode");
        // Pass through this specific error to be handled by the UI
        throw error;
      }

      if (status === 400 || status === 404) {
        // Pass specific error messages from the API
        throw new Error(data.message || "Payment request failed");
      }
    }

    // For network errors or other issues
    throw new Error(
      "Could not connect to payment service. Please try again later."
    );
  }
};

// Verify payment after completion
export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<any> => {
  try {
    const response = await api.post("/payments/verify", {
      paymentId,
      orderId,
      signature,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

// Withdraw a participant from a hackathon
export const withdrawParticipant = async (
  hackathonId: string,
  participantId: string
): Promise<boolean> => {
  try {
    await api.delete(
      `/hackathons/${hackathonId}/participants/${participantId}`
    );
    return true;
  } catch (error) {
    console.error("Error withdrawing from hackathon:", error);
    throw error;
  }
};

// Submit a project for a hackathon
export const submitProject = async (
  hackathonId: string,
  participantId: string,
  submission: {
    githubLink: string;
    projectDescription: string;
    submissionDate: string;
  }
): Promise<any> => {
  try {
    // The backend expects hackathonId and participantId in the body
    const response = await api.post(
      `/hackathons/${hackathonId}/submit-project`,
      {
        hackathonId,
        participantId,
        ...submission,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting project:", error);
    throw error;
  }
};
