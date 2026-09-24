import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../schemas/auth.schema';
import { useAuth } from '../hooks/useAuth.js';
import "../auth.style.scss";

const Register = () => {
  const navigate = useNavigate();
  const { handleRegister } = useAuth();
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    setIsSubmitting(true);
    try {
      const res = await handleRegister({ name: data.name, email: data.email, password: data.password });
      if (res?.error) {
        setApiError(res.error);
      } else {
        navigate('/login');
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login">
        <div className="login__card">
          <div className="login__header">
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate('/login')}
              title="Back to Login"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Login
            </button>
            <h2 className="login__title">Create Account</h2>
            <p className="login__subtitle">Join Resume Analyzer to build your AI interview strategy</p>
          </div>

          {apiError && (
            <div className="alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          <form className="login__form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="login__inputGroup">
              <label htmlFor="name">Username</label>
              <input
                type="text"
                id="name"
                placeholder="John Doe"
                className={errors.name ? 'input--error' : ''}
                {...register('name')}
              />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </div>

            <div className="login__inputGroup">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="name@example.com"
                className={errors.email ? 'input--error' : ''}
                {...register('email')}
              />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>

            <div className="login__inputGroup">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="At least 6 characters"
                className={errors.password ? 'input--error' : ''}
                {...register('password')}
              />
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </div>

            <button className="login__button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="button-spinner">
                  <span className="spinner"></span> Creating Account...
                </span>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <p className="login__footer">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;
