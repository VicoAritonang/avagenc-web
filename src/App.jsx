import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { GuestRoute } from './components/GuestRoute'

// Lazy Load Pages
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/auth/Login'))
const Signup = lazy(() => import('./pages/auth/Signup'))
const GmailCallback = lazy(() => import('./pages/auth/GmailCallback'))
const CalendarCallback = lazy(() => import('./pages/auth/CalendarCallback'))
const Chat = lazy(() => import('./pages/Chat'))
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const Services = lazy(() => import('./pages/dashboard/Services'))
const ServiceDetail = lazy(() => import('./pages/dashboard/ServiceDetail'))
const Contacts = lazy(() => import('./pages/dashboard/Contacts'))
const Billing = lazy(() => import('./pages/dashboard/Billing'))

const LoadingFallback = () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
)

function App() {
    return (
        <AuthProvider>
            <Toaster position="top-right" />
            <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        {/* Public Routes - Redirect to dashboard if logged in */}
                        <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
                        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
                        <Route path="/auth/callback/gmail" element={<GmailCallback />} />
                        <Route path="/auth/callback/calendar" element={<CalendarCallback />} />

                        {/* Protected Chat Route */}
                        <Route
                            path="/chat"
                            element={
                                <ProtectedRoute>
                                    <Chat />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected Dashboard Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Dashboard />} />
                            <Route path="services" element={<Services />} />
                            <Route path="services/:serviceName" element={<ServiceDetail />} />
                            <Route path="contacts" element={<Contacts />} />
                            <Route path="billing" element={<Billing />} />
                        </Route>

                        {/* Catch all - redirect to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
