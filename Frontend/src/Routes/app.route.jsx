import { lazy, Suspense } from "react"
import {createBrowserRouter} from "react-router-dom"
import Protected from "../features/auth/components/Protected.jsx"

const withPage = (loadPage, isProtected = false) => {
    const Page = lazy(loadPage)

    return <Suspense fallback={(
        <main className="page-loading" role="status" aria-live="polite">
            <span className="page-loading__spinner" />
            <span>Loading your workspace</span>
        </main>
    )}>
        {isProtected ? <Protected><Page /></Protected> : <Page />}
    </Suspense>
}

export const router = createBrowserRouter([{
        path: "/login",
        element: withPage(() => import("../features/auth/pages/Login.jsx"))
    },
    {
        path: "/register",
        element: withPage(() => import("../features/auth/pages/Register.jsx"))
    },
    {
        path: "/",
        element: withPage(() => import("../features/ai/pages/home.jsx"), true)
    },
    {
        path: "/interview/:interviewId",
        element: withPage(() => import("../features/ai/pages/airesult.jsx"), true)
    },
    {
        path: "/jobs",
        element: withPage(() => import("../features/jobs/pages/jobs.jsx"), true)
    }
])
