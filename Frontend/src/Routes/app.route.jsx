import {createBrowserRouter} from "react-router-dom"
import Register from "../features/auth/pages/Register.jsx"
import Login from "../features/auth/pages/Login.jsx"
import Protected from "../features/auth/components/Protected.jsx"
import Home from "../features/ai/pages/home.jsx"
import Interview from "../features/ai/pages/airesult.jsx"
export const router = createBrowserRouter([ {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Protected>
            <Home />
        </Protected>
    },
    {
        path: "/interview/:interviewId",
        element: <Protected>
            <Interview />
        </Protected>
    }
])
