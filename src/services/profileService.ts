import { ParticipantProfile } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const profileService = {
  // Get user's profile
  async getProfile(userId: string): Promise<ParticipantProfile | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
        credentials: "include",
      });

      if (response.status === 404) {
        return null; // Profile doesn't exist yet
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  // Create or update profile
  async saveProfile(
    profileData: Partial<ParticipantProfile>
  ): Promise<ParticipantProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  },

  // Get all public profiles (for explore participants page)
  async getAllProfiles(): Promise<ParticipantProfile[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profiles");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }
  },

  // Delete profile
  async deleteProfile(userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete profile");
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw error;
    }
  },
};

export default profileService;
