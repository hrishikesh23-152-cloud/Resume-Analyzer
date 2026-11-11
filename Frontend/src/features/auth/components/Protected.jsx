import { useAuth } from "../hooks/useAuth.js";
import { Navigate } from "react-router";
import React from 'react'

const Protected = ({children}) => {
    const { loading, user, sessionError, retrySession } = useAuth()


    if(loading){
        return (
            <main className="page-loading" role="status" aria-live="polite">
                <span className="page-loading__spinner" />
                <span>Checking your session</span>
            </main>
        )
    }

    if (sessionError) {
        return (
            <main className="page-loading" role="alert">
                <span>{sessionError}</span>
                <button type="button" className="session-retry-button" onClick={retrySession}>
                    Retry session check
                </button>
            </main>
        )
    }

    if(!user){
        return <Navigate to={'/login'} />
    }
    
    return children
}

export default Protected