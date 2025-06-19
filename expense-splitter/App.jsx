import React from "react"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from './src/pages/Welcome'
import Login from './src/pages/Login'
import Signin from './src/pages/Signin'
import { Dashboard } from "./src/pages/Dashboard";
import { Addexpense } from "./src/pages/Addexpense";
import { Settleexpense } from "./src/pages/Settleexpense";
import { FriendTransactions } from "./src/pages/FriendTransactions";
import {Notification} from "./src/pages/Notifications"

const App = ()=>{
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Welcome/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/signup" element={<Signin/>} />
                <Route path="/dashboard" element={<Dashboard/>} />
                <Route path="/addexpense" element={<Addexpense/>} />
                <Route path="/settleexpense" element={<Settleexpense/>} />
                <Route path="/friend-transactions" element={<FriendTransactions />} /> 
                <Route path="/notification" element={<Notification />} /> 
            </Routes>
        </Router>
    )
}
export default App