import React from 'react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useContext(AuthContext);
    const { isAuthenticated } = useContext(AuthContext);
    const {loading} = useContext(AuthContext);

    //SHOWING LOADING WHILE AUTHENTICATION IS BEING INITIALIZED
    if(loading){
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
    }


    // 1. Not logged in at all → redirect to login
    if (!isAuthenticated) {
        return <Navigate to='/auth/login' />
    }
    // 2. Logged in but role not allowed → send to home (or 403 page)
    if(allowedRoles && !allowedRoles.includes(user?.role)){
        return <Navigate to='/' />
    }
    // 3. Otherwise, render the protected content
    return children
  
}
