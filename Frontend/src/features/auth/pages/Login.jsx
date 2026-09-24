import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/auth.schema';
import { useAuth } from '../hooks/useAuth.js';
import "../auth.style.scss";

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    setIsSubmitting(true);
    try {
      const res = await handleLogin({ email: data.email, password: data.password });
      if (res?.error) {
        setApiError(res.error);
      } else {
        navigate('/');
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
              onClick={() => navigate('/')}
              title="Back to Home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
            <h2 className="login__title">Welcome Back</h2>
            <p className="login__subtitle">Log in to manage your AI interview plans</p>
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
                placeholder="••••••••"
                className={errors.password ? 'input--error' : ''}
                {...register('password')}
              />
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </div>

            <button className="login__button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="button-spinner">
                  <span className="spinner"></span> Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="login__footer">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
