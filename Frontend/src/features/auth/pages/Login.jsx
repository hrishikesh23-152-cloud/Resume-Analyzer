import React from 'react'
import { useState,useEffect } from 'react'
import { Link } from 'react-router-dom'
import "../auth.style.scss"
import { useAuth } from '../hooks/useAuth.js'
import { useNavigate } from 'react-router-dom'
const Login = () => {
  const navigate = useNavigate()
  const {user, loading,  handleLogin} = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const handlesubmit = async (e)=>{
    e.preventDefault()
    await handleLogin({email, password})
    navigate("/")
  }
  // console.log(user)
  if(loading){
    
    return <div><h1>Loading...</h1></div>
  }

  return (
     <main>
        <div className="login">
      <div className="login__card">
        <h2 className="login__title">Login</h2>

        <form className="login__form" onSubmit={handlesubmit}>
          <div className="login__inputGroup">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login__inputGroup">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login__button" type='submit'>Login</button>
        </form>

        <p className="login__footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
     </main>
  )
}

export default Login
