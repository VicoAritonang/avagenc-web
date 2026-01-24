import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const GuestRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    // If user is logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    // Otherwise, show the page (login, signup, landing)
    return children
}
