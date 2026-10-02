import axios from "axios";

const API_URL =  "https://resume-analyzer-backend-3z1r.onrender.com";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

export const findJobsFromProfile = async ({ interviewId, where, country } = {}) => {
    const path = interviewId
        ? `/api/jobs/from-report/${interviewId}`
        : "/api/jobs";

    const response = await api.get(path, {
        params: { where, country }
    });

    return response.data;
};
