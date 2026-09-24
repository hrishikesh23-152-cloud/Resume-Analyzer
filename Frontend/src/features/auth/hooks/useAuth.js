import { useContext, useEffect } from "react";
import { AuthContext } from "../context/auth.context";
import { register, login, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            setUser(data.user);
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

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe();
                setUser(data.user);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getAndSetUser();
    }, []);

    return { user, loading, handleRegister, handleLogin, handleLogout };
};