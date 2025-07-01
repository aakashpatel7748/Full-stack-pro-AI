import {BrowserRouter,  Routes, Route} from "react-router-dom"
import Auth from "../views/auth/Auth"
import Chat from "../views/chat/Chat"


export const Router = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<h1>Home</h1>}/>
            <Route path="/auth" element={<Auth/>}/>
            <Route path="/auth/success" element={<h1>success route!</h1>}/>
            <Route path="/chat" element={<Chat/>}/>
            <Route path="*" element={<h1>404 Not Found</h1>}/>
        </Routes>
    </BrowserRouter>
  )
}
