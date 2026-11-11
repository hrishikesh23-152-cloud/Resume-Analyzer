import { useContext } from "react";
import { AuthContext } from "../context/auth.context.value.js";
import { register, login, logout } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { user, setUser, loading, setLoading, sessionError, retrySession, setSessionError } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            setUser(data.user);
            setSessionError(null);
            return data;
        } catch (err) {
            console.error("Login Error:", err);
            const msg = err.response?.data?.message || err.message || "Invalid credentials";
            return { error: msg };
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ name, email, password }) => {
        setLoading(true);
        try {
            const data = await register({ name, email, password });
            setUser(data.user);
            setSessionError(null);
            return data;
        } catch (err) {
            console.error("Register Error:", err);
            const msg = err.response?.data?.message || err.message || "Registration failed";
            return { error: msg };
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
        } catch (err) {
            console.error("Logout Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, sessionError, retrySession, handleRegister, handleLogin, handleLogout };
};