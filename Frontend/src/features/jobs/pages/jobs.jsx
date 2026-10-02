import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { findJobsFromProfile } from "../services/jobs.api";
import "../../ai/style/home.scss";
import "../style/jobs.scss";

const JobFinder = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const interviewId = searchParams.get("interviewId");

    const [where, setWhere] = useState("");
    const [country, setCountry] = useState("in");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [roles, setRoles] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [sourceReport, setSourceReport] = useState(null);
    const [activeRole, setActiveRole] = useState("all");
    const [searched, setSearched] = useState(false);

    const filteredJobs = useMemo(() => {
        if (activeRole === "all") return jobs;
        return jobs.filter((job) => job.role === activeRole);
    }, [jobs, activeRole]);

    const runSearch = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await findJobsFromProfile({
                interviewId,
                where,
                country
            });

            setRoles(response.roles || []);
            setJobs(response.jobs || []);
            setSourceReport(response.sourceReport || null);
            setActiveRole("all");
            setSearched(true);

            if (response.errors?.length && !response.jobs?.length) {
                setError(response.errors[0].message);
            } else if (!response.roles?.length) {
                setError(response.message || "No matching roles found in your saved resume.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Could not fetch job listings.");
            setRoles([]);
            setJobs([]);
            setSourceReport(null);
            setSearched(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interviewId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        runSearch();
    };

    const formatSalary = (job) => {
        if (!job.salaryMin && !job.salaryMax) return "Salary not listed";
        const min = job.salaryMin ? Math.round(job.salaryMin).toLocaleString() : null;
        const max = job.salaryMax ? Math.round(job.salaryMax).toLocaleString() : null;
        if (min && max) return `${min} - ${max}`;
        return min || max;
    };

    return (
        <div className="jobs-page">
            {loading && (
                <div className="ai-loading-overlay">
                    <div className="ai-loading-card">
                        <h2>Finding Matching Jobs</h2>
                        <p className="loading-step-text">Reading your saved resume and searching live listings...</p>
                    </div>
                </div>
            )}

            <nav className="top-nav">
                <div className="nav-brand" onClick={() => navigate("/")} role="button">
                    <div className="brand-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                    </div>
                    <span className="brand-title">Resume<span className="brand-accent">Analyzer</span></span>
                </div>

                <div className="user-actions">
                    <Link to="/" className="nav-link-btn">Interview Plans</Link>
                    {user && (
                        <div className="user-chip">
                            <span className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                            <span className="user-name">{user.name || user.email}</span>
                        </div>
                    )}
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </nav>

            <header className="page-header">
                <h1>Jobs Matched To Your <span className="highlight">Saved Resume</span></h1>
                <p>We pull your latest interview report from the database, map skills to Frontend, Backend, and DevOps, then search Adzuna.</p>
            </header>

            <form className="jobs-search-card" onSubmit={handleSubmit}>
                {sourceReport && (
                    <p className="report-hint">
                        Using saved report: {sourceReport.title || "Interview plan"} {sourceReport.createdAt ? `• ${new Date(sourceReport.createdAt).toLocaleDateString()}` : ""}
                    </p>
                )}

                <div className="jobs-filters">
                    <input
                        type="text"
                        value={where}
                        onChange={(e) => setWhere(e.target.value)}
                        placeholder="City, e.g. Bengaluru"
                    />
                    <select value={country} onChange={(e) => setCountry(e.target.value)}>
                        <option value="in">India</option>
                        <option value="us">United States</option>
                        <option value="gb">United Kingdom</option>
                        <option value="ca">Canada</option>
                        <option value="au">Australia</option>
                    </select>
                    <button type="submit" className="generate-btn" disabled={loading}>
                        Refresh Jobs
                    </button>
                </div>
            </form>

            {error && (
                <div className="jobs-error">
                    {error}
                    {error.includes("interview plan") && (
                        <Link to="/" className="nav-link-btn" style={{ marginLeft: "0.75rem" }}>Create a plan</Link>
                    )}
                </div>
            )}

            {roles.length > 0 && (
                <div className="role-chips">
                    <button
                        className={`role-chip ${activeRole === "all" ? "role-chip--active" : ""}`}
                        onClick={() => setActiveRole("all")}
                    >
                        All roles
                    </button>
                    {roles.map((role) => (
                        <button
                            key={role.title}
                            className={`role-chip ${activeRole === role.title ? "role-chip--active" : ""}`}
                            onClick={() => setActiveRole(role.title)}
                        >
                            {role.title}
                            <span>{role.matchedSkills.join(", ")}</span>
                        </button>
                    ))}
                </div>
            )}

            {searched && !loading && filteredJobs.length === 0 && !error && (
                <div className="jobs-empty">No live listings were returned for the matched roles.</div>
            )}

            <section className="jobs-grid">
                {filteredJobs.map((job) => (
                    <article key={`${job.role}-${job.id}`} className="job-card">
                        <div className="job-card__top">
                            <span className="job-role-badge">{job.role}</span>
                            <span className="job-salary">{formatSalary(job)}</span>
                        </div>
                        <h3>{job.title}</h3>
                        <p className="job-company">{job.company}</p>
                        <p className="job-location">{job.location}</p>
                        <p className="job-description">{(job.description || "").replace(/<[^>]+>/g, "").slice(0, 180)}...</p>
                        {job.url && (
                            <a className="apply-btn" href={job.url} target="_blank" rel="noreferrer">
                                View listing
                            </a>
                        )}
                    </article>
                ))}
            </section>
        </div>
    );
};

export default JobFinder;
