import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { homeSchema } from '../schemas/ai.schema';
import { useAi } from '../hooks/usAi';
import { useAuth } from '../../auth/hooks/useAuth';
import "../style/home.scss";

const Home = () => {
    const { user, handleLogout } = useAuth();
    const { loading, generateReport, reports } = useAi();
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState(null);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    const resumeInputRef = useRef();

    const loadingSteps = [
        "Analyzing target job description...",
        "Scanning resume & evaluating experience...",
        "Identifying technical & behavioral skill gaps...",
        "Formulating 7-day targeted preparation plan...",
        "Finalizing your personalized interview strategy..."
    ];

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(homeSchema),
        defaultValues: {
            jobDescription: '',
            selfDescription: '',
            resumeFile: null
        }
    });

    const jobDescriptionVal = watch('jobDescription') || '';

    useEffect(() => {
        let interval;
        if (loading) {
            setLoadingMessageIndex(0);
            interval = setInterval(() => {
                setLoadingMessageIndex((prev) => (prev + 1) % loadingSteps.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setValue('resumeFile', e.target.files, { shouldValidate: true });
            trigger('selfDescription');
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setValue('resumeFile', null, { shouldValidate: true });
        if (resumeInputRef.current) {
            resumeInputRef.current.value = '';
        }
        trigger('selfDescription');
    };

    const onSubmit = async (data) => {
        const resumeFile = selectedFile || (resumeInputRef.current?.files?.[0] ?? null);
        try {
            const result = await generateReport({
                jobDescription: data.jobDescription,
                selfDescription: data.selfDescription,
                resumeFile
            });
            if (result?._id) {
                navigate(`/interview/${result._id}`);
            }
        } catch (err) {
            console.error("Error generating report:", err);
        }
    };

    return (
        <div className='home-page'>
            {/* Loading Overlay */}
            {loading && (
                <div className='ai-loading-overlay'>
                    <div className='ai-loading-card'>
                        <div className='ai-pulse-ring'>
                            <div className='ai-pulse-icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                            </div>
                        </div>
                        <h2>Crafting Your AI Strategy</h2>
                        <p className='loading-step-text'>{loadingSteps[loadingMessageIndex]}</p>
                        <div className='loading-progress-bar'>
                            <div className='loading-progress-fill'></div>
                        </div>
                        <span className='loading-subtext'>This takes approximately 15-30 seconds</span>
                    </div>
                </div>
            )}

            {/* Top Navigation / Header */}
            <nav className='top-nav'>
                <div className='nav-brand'>
                    <div className='brand-icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                    </div>
                    <span className='brand-title'>Resume<span className='brand-accent'>Analyzer</span></span>
                </div>

                <div className='user-actions'>
                    {user && (
                        <div className='user-chip'>
                            <span className='user-avatar'>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                            <span className='user-name'>{user.name || user.email}</span>
                        </div>
                    )}
                    <button onClick={handleLogout} className='logout-btn' title='Sign Out'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Our AI analyzes job requirements against your unique experience to generate technical questions, behavioral prompts, and a tailored study roadmap.</p>
            </header>

            {/* Main Form Card */}
            <form onSubmit={handleSubmit(onSubmit)} className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>

                        <textarea
                            {...register('jobDescription')}
                            className={`panel__textarea ${errors.jobDescription ? 'input--error' : ''}`}
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Full Stack Engineer position requiring React, Node.js, System Design, and REST API architecture...'`}
                            maxLength={5000}
                        />

                        <div className='panel__footer-meta'>
                            {errors.jobDescription ? (
                                <span className='field-error'>{errors.jobDescription.message}</span>
                            ) : <span></span>}
                            <div className='char-counter'>{jobDescriptionVal.length} / 5000 chars</div>
                        </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>

                            {!selectedFile ? (
                                <label className='dropzone' htmlFor='resume'>
                                    <span className='dropzone__icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="16 16 12 12 8 16" />
                                            <line x1="12" y1="12" x2="12" y2="21" />
                                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                        </svg>
                                    </span>
                                    <p className='dropzone__title'>Click to select file</p>
                                    <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>
                                    <input
                                        ref={resumeInputRef}
                                        hidden
                                        type='file'
                                        id='resume'
                                        accept='.pdf,.docx'
                                        onChange={handleFileChange}
                                    />
                                </label>
                            ) : (
                                <div className='file-preview-card'>
                                    <div className='file-info'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                        </svg>
                                        <div className='file-details'>
                                            <span className='file-name'>{selectedFile.name}</span>
                                            <span className='file-size'>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                    </div>
                                    <button type='button' className='remove-file-btn' onClick={handleRemoveFile} title="Remove file">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                id='selfDescription'
                                {...register('selfDescription')}
                                className={`panel__textarea panel__textarea--short ${errors.selfDescription ? 'input--error' : ''}`}
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                                onChange={(e) => {
                                    setValue('selfDescription', e.target.value);
                                    trigger('selfDescription');
                                }}
                            />
                        </div>

                        {errors.selfDescription && (
                            <span className='field-error field-error--banner'>{errors.selfDescription.message}</span>
                        )}

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" />
                                </svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        AI-Powered Strategy Generation &bull; Approx 20-30s
                    </span>

                    <button
                        type='submit'
                        disabled={loading}
                        className='generate-btn'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </form>

            {/* Recent Reports List */}
            {reports && reports.length > 0 && (
                <section className='recent-reports'>
                    <div className='section-title-bar'>
                        <h2>My Recent Interview Plans</h2>
                        <span className='plans-count'>{reports.length} reports</span>
                    </div>

                    <div className='reports-grid'>
                        {reports.map(report => (
                            <div
                                key={report._id}
                                className='report-card'
                                onClick={() => navigate(`/interview/${report._id}`)}
                            >
                                <div className='report-card__header'>
                                    <h3>{report.title || 'Target Position'}</h3>
                                    <span className={`match-badge ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                        {report.matchScore}% Match
                                    </span>
                                </div>
                                <p className='report-meta'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    Generated {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <div className='report-card__footer'>
                                    <span>View Details</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <div className='footer-links'>
                    <a href='#'>Privacy Policy</a>
                    <a href='#'>Terms of Service</a>
                    <a href='#'>Help Center</a>
                </div>
            </footer>
        </div>
    );
};

export default Home;