import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useProfile } from '../../hooks/useProfile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import ProfileEditor from '../../components/dashboard/ProfileEditor'
import WhatsAppSection from '../../components/dashboard/WhatsAppSection'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react'
import { formatCurrency, formatNumber } from '../../lib/utils'

export default function Dashboard() {
    const { user } = useAuth()
    const { profile } = useProfile()
    const [billing, setBilling] = useState(null)
    const [usageData, setUsageData] = useState([])
    const [stats, setStats] = useState({
        balance: 0,
        totalUsage: 0,
        activeServices: 0
    })

    useEffect(() => {
        fetchDashboardData()
    }, [user])

    const fetchDashboardData = async () => {
        if (!user) return

        // Fetch billing info
        const { data: billingData } = await supabase
            .from('billing')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (billingData) {
            setBilling(billingData)
            setStats(prev => ({
                ...prev,
                balance: billingData.balance || 0,
                totalUsage: billingData.usage || 0
            }))

            // Fetch usage history for graph (user_id FK, order by id DESC)
            const { data: usageHistory } = await supabase
                .from('usage')
                .select('*')
                .eq('user_id', user.id)
                .order('id', { ascending: false })
                .limit(10)

            if (usageHistory) {
                // Reverse for chronological order in chart
                const chartData = usageHistory.reverse().map(item => ({
                    date: new Date(item.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                    value: item.value
                }))
                setUsageData(chartData)
            }
        }

        // Count active services
        const { data: gmailConnection } = await supabase
            .from('gmail_connect')
            .select('*')
            .eq('user_id', user.id)

        setStats(prev => ({
            ...prev,
            activeServices: gmailConnection?.length || 0
        }))
    }

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-4 mb-2">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={profile?.image_url || user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-2xl">
                            {(profile?.name || user?.email)?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Welcome back, {profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
                        </h1>
                        <p className="text-gray-400">{profile?.about || "Here's your AI assistant overview"}</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">Balance</CardTitle>
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{formatCurrency(stats.balance)}</div>
                            <p className="text-xs text-gray-400 mt-1">Available tokens</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">Total Usage</CardTitle>
                            <Activity className="w-5 h-5 text-white" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{formatNumber(stats.totalUsage)}</div>
                            <p className="text-xs text-gray-400 mt-1">Tokens used</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">Active Services</CardTitle>
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats.activeServices}</div>
                            <p className="text-xs text-gray-400 mt-1">Connected integrations</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Usage Graph */}
            {usageData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Trend</CardTitle>
                            <CardDescription>Your token usage over the last 10 activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={usageData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="date" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#a855f7"
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-white" />
                            Quick Start
                        </CardTitle>
                        <CardDescription>Get started with your AI assistant</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <a
                                href="/chat"
                                className="glass-card p-6 hover:bg-white/10 transition-all cursor-pointer group"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                                    Start Chatting
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Begin a conversation with your AI assistant
                                </p>
                            </a>
                            <a
                                href="/dashboard/services"
                                className="glass-card p-6 hover:bg-white/10 transition-all cursor-pointer group"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                                    Connect Services
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Link your Gmail, Calendar, and more
                                </p>
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* WhatsApp Assistant */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <WhatsAppSection />
            </motion.div>

            {/* Profile Editor */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
            >
                <ProfileEditor />
            </motion.div>
        </div>
    )
}


