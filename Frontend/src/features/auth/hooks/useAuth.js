import { useContext, useEffect } from "react";
import { AuthContext } from "../context/auth.context";
import { register, login, logout,getMe } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            // console.log("Logging in with", email, password)
            const data = await login({ email, password })
            setUser(data.user)
            // console.log(data.message)
            // console.log(user);s
            
        } catch (err) {
            console.log(err);
           
        } finally {
            console.log("Executed");
            
            setLoading(false)
        }
    }

    const handleRegister = async ({ name, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ name, email, password })
            console.log(data)
            setUser(data.user)
        } catch (err) {
            console.log(err.message  )
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
        } catch (err) {
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

        
    

    useEffect(() => {

        const getAndSetUser = async () => {
            try {

                const data = await getMe()
                setUser(data.user)
            } catch (err) { } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}