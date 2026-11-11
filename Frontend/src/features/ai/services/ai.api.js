import axios from "axios";

const API_URL =  "https://resume-analyzer-backend-3z1r.onrender.com";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

const readAiUsage = (headers) => {
    const readNumber = (name) => {
        const rawValue = headers?.get?.(name) ?? headers?.[name.toLowerCase()];
        if (rawValue === null || rawValue === undefined || rawValue === '') return null;

        const value = Number(rawValue);
        return Number.isFinite(value) ? value : null;
    };

    return {
        tokensUsed: readNumber("x-ai-tokens-used"),
        tokensUsedWindow: readNumber("x-ai-tokens-used-window"),
        tokensRemaining: readNumber("x-ai-tokens-remaining"),
        tokensLimit: readNumber("x-ai-tokens-limit"),
        requestsUsed: readNumber("x-ai-requests-used"),
        requestsRemaining: readNumber("x-ai-requests-remaining"),
        requestsLimit: readNumber("x-ai-requests-limit")
    };
};

export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData();
    if (jobDescription) formData.append("jobDescription", jobDescription);
    if (selfDescription) formData.append("selfDescription", selfDescription);

    let actualFile = null;
    if (resumeFile) {
        if (resumeFile instanceof File) {
            actualFile = resumeFile;
        } else if (resumeFile instanceof FileList && resumeFile.length > 0) {
            actualFile = resumeFile[0];
        }
    }

    if (actualFile) {
        formData.append("resume", actualFile);
    }

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return { ...response.data, aiUsage: readAiUsage(response.headers) };
};

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return { ...response.data, aiUsage: readAiUsage(response.headers) };
};

export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/");
    return { ...response.data, aiUsage: readAiUsage(response.headers) };
};
