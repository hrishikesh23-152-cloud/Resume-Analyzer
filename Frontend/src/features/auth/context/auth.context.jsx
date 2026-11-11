import { useEffect, useState } from "react";
import { AuthContext } from "./auth.context.value.js";
import { getMe } from "../services/auth.api";

export const AuthProvider = ({ children }) => { 

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [sessionError, setSessionError] = useState(null)
    const [retryAttempt, setRetryAttempt] = useState(0)

    useEffect(() => {
        let isMounted = true

        const checkSession = async () => {
            try {
                for (let attempt = 0; attempt < 2; attempt += 1) {
                    try {
                        const data = await getMe()
                        if (isMounted) {
                            setUser(data.user)
                            setSessionError(null)
                        }
                        return
                    } catch (error) {
                        const status = error.response?.status
                        if (status === 401 || status === 403 || status === 404) {
                            if (isMounted) setUser(null)
                            return
                        }

                        if (attempt === 0) {
                            await new Promise((resolve) => setTimeout(resolve, 750))
                        } else if (isMounted) {
                            setSessionError("We couldn't verify your session. Check your connection and try again.")
                        }
                    }
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        checkSession()

        return () => {
            isMounted = false
        }
    }, [retryAttempt])

    const retrySession = () => {
        setSessionError(null)
        setLoading(true)
        setRetryAttempt((attempt) => attempt + 1)
    }


    return (
        <AuthContext.Provider value={{
            user, setUser, loading, setLoading, sessionError, retrySession, setSessionError
        }}>
            {children}
        </AuthContext.Provider>
    )
}