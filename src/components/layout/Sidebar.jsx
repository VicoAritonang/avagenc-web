import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, MessageSquare, Zap, CreditCard, Users, LogOut, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { user, signOut } = useAuth()
    const location = useLocation()

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Contact', href: '/dashboard/contacts', icon: Users },
        { name: 'Chat', href: '/chat', icon: MessageSquare },
        { name: 'Services', href: '/dashboard/services', icon: Zap },
        { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    ]

    const isActive = (href) => {
        if (href === '/dashboard' || href === '/chat') {
            return location.pathname === href
        }
        return location.pathname.startsWith(href)
    }

    const handleLogout = async () => {
        await signOut()
    }

    return (
        <AnimatePresence>
            {(sidebarOpen || window.innerWidth >= 768) && (
                <motion.aside
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    transition={{ duration: 0.3 }}
                    className="fixed md:sticky md:top-0 w-64 h-screen glass-card border-r border-white/10 z-40 flex flex-col"
                >
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <Link to="/" className="flex items-center gap-2">
                                <img src="/avagenc.png" alt="Avagenc Logo" className="w-8 h-8" />
                                <span className="text-2xl font-bold gradient-text">Avagenc</span>
                            </Link>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="md:hidden text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation - Scrollable */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)
                            return (
                                <Link key={item.name} to={item.href} onClick={() => setSidebarOpen(false)}>
                                    <div
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                                                ? 'bg-gradient-to-r from-white/30 to-gray-400/30 text-white border border-white/50'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-white/10 flex-shrink-0">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar>
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback>
                                    {user?.email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-400 hover:text-red-300"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    )
}
