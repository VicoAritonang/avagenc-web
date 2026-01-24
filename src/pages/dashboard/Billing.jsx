import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { DollarSign, TrendingDown, Clock } from 'lucide-react'
import { formatCurrency, formatNumber, formatDate } from '../../lib/utils'

export default function Billing() {
    const { user } = useAuth()
    const [billing, setBilling] = useState(null)
    const [usageHistory, setUsageHistory] = useState([])
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBillingData()
    }, [user])

    const fetchBillingData = async () => {
        if (!user) return

        setLoading(true)

        // Fetch billing info (user_id is now the PK)
        const { data: billingData } = await supabase
            .from('billing')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (billingData) {
            setBilling(billingData)

            // Fetch usage history (user_id is now FK directly, order by id DESC)
            const { data: usageData } = await supabase
                .from('usage')
                .select('*')
                .eq('user_id', user.id)
                .order('id', { ascending: false })

            if (usageData) {
                setUsageHistory(usageData)

                // Prepare chart data (last 30 entries, reversed for chronological order)
                const chartEntries = usageData.slice(0, 30).reverse()
                const formattedData = chartEntries.map(item => ({
                    date: new Date(item.time).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short'
                    }),
                    value: item.value,
                    fullDate: new Date(item.time)
                }))
                setChartData(formattedData)
            }
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-8 h-8 text-green-400" />
                    <h1 className="text-3xl font-bold text-white">Billing & Usage</h1>
                </div>
                <p className="text-gray-400">Monitor your balance and token usage</p>
            </motion.div>

            {/* Balance & Usage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card className="border-2 border-green-500/30">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Current Balance</span>
                                <DollarSign className="w-6 h-6 text-green-400" />
                            </CardTitle>
                            <CardDescription>Available tokens in your account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-bold gradient-text mb-2">
                                {formatCurrency(billing?.balance || 0)}
                            </div>
                            <p className="text-sm text-gray-400">
                                Pay-as-you-go billing • Top up anytime
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="border-2 border-white/30">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Total Usage</span>
                                <TrendingDown className="w-6 h-6 text-white" />
                            </CardTitle>
                            <CardDescription>Tokens consumed across all services</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-bold text-white mb-2">
                                {formatNumber(billing?.usage || 0)}
                            </div>
                            <p className="text-sm text-gray-400">
                                Total tokens used
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Usage Graph */}
            {chartData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Over Time</CardTitle>
                            <CardDescription>Your token consumption trend</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid rgba(168, 85, 247, 0.3)',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#a855f7"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorUsage)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Usage History List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" />
                            Usage History
                        </CardTitle>
                        <CardDescription>Recent token consumption activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {usageHistory.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                                {usageHistory.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="flex items-center justify-between p-4 glass-card hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <h4 className="text-white font-medium">{item.title}</h4>
                                            <p className="text-sm text-gray-400">{formatDate(item.time)}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-white">
                                                -{formatNumber(item.value)}
                                            </div>
                                            <p className="text-xs text-gray-400">tokens</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-400">No usage history yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}


