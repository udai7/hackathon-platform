import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

interface ProjectEvaluation {
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
}

export const evaluateProject = async (
  projectDescription: string,
  githubLink: string
): Promise<ProjectEvaluation> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As an expert technical evaluator, analyze this hackathon project:
    Project Description: ${projectDescription}
    GitHub Link: ${githubLink}
    
    Please provide a comprehensive evaluation including:
    1. Overall score out of 100
    2. Detailed metrics (0-100) for:
       - Innovation and creativity
       - Technical complexity
       - Code quality
       - User experience
       - Documentation
       - Scalability
       - Maintainability
    3. Key strengths of the project
    4. Areas for improvement
    5. Specific recommendations for enhancement
    6. Detailed feedback explaining the evaluation
    
    Format your response as JSON with the following structure:
    {
      "score": number,
      "feedback": string,
      "metrics": {
        "innovation": number,
        "technicalComplexity": number,
        "codeQuality": number,
        "userExperience": number,
        "documentation": number,
        "scalability": number,
        "maintainability": number
      },
      "strengths": string[],
      "areasForImprovement": string[],
      "recommendations": string[]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const evaluation = JSON.parse(text);

    return evaluation;
  } catch (error) {
    console.error("Error evaluating project:", error);
    throw new Error("Failed to evaluate project");
  }
};

export const rankProjects = async (
  projects: Array<{ description: string; githubLink: string }>
): Promise<Array<{ index: number; score: number; feedback: string }>> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Compare and rank these hackathon projects:
    ${projects
      .map(
        (p, i) => `Project ${i + 1}:
    Description: ${p.description}
    GitHub: ${p.githubLink}`
      )
      .join("\n\n")}
    
    Please rank these projects based on:
    1. Overall technical merit
    2. Innovation and creativity
    3. Implementation quality
    4. Potential impact
    
    For each project, provide:
    1. Rank (1 being best)
    2. Score out of 100
    3. Brief justification for the ranking
    
    Format your response as JSON with the following structure:
    [
      {
        "index": number,
        "score": number,
        "feedback": string
      }
    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const rankings = JSON.parse(text);

    return rankings;
  } catch (error) {
    console.error("Error ranking projects:", error);
    throw new Error("Failed to rank projects");
  }
};

export default {
  evaluateProject,
  rankProjects,
};
