import {router} from "./Routes/app.route"
import { RouterProvider } from "react-router-dom"
// import './App.css'
import { AiProvider } from "./features/ai/context/ai.context.jsx"
import { AuthProvider } from "./features/auth/context/auth.context.jsx"
function App() {
  

  return (
   
  <AuthProvider>
    <AiProvider>
      <RouterProvider router={router} />
    </AiProvider>
  </AuthProvider>
  
    
  )
}

export default App
