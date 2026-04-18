import React from 'react'
import "../auth.style.scss"
import { useNavigate,Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
const Register = () => {
  const {user,loading, handleRegister} = useAuth() 
  const navigate = useNavigate()
  const [name, setUsername] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const handlesubmit = async (e)=>{
    e.preventDefault()
    await handleRegister({name, email, password})
    navigate("/login")
  }
  if(loading){
    return <div><h1>Loading...</h1></div>
  }


  return (
    <div>
       <main>
        <div className="login">
      <div className="login__card">
        <h2 className="login__title">Register</h2>

        <form className="login__form" onSubmit={handlesubmit}>
          <div className="login__inputGroup">
            <label htmlFor="name">Username</label>
            <input type="text" id="name" placeholder="Enter your username" onChange={((e)=>setUsername(e.target.value))} />
          </div>
          <div className="login__inputGroup">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" onChange={((e)=>setEmail(e.target.value))} />
          </div>

          <div className="login__inputGroup">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" onChange={((e)=>setPassword(e.target.value))} />
          </div>

          <button className="login__button" >Register</button>
        </form>

        <p className="login__footer">
          Already have an account?<span> <Link to="/login">Login</Link></span>
        </p>
      </div>
    </div>
     </main>
    </div>
  )
}

export default Register
