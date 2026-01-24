import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import ChatInput from '../components/chat/ChatInput'
import Message from '../components/chat/Message'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'
import { Menu, X, LogOut, ChevronUp, FlaskConical, Rocket } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Chat() {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [oldestMessageId, setOldestMessageId] = useState(null)
    const [environment, setEnvironment] = useState('prod') // 'prod' or 'test'
    const [connectivity, setConnectivity] = useState(null) // User's connectivity string
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const { user, signOut } = useAuth()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (user) {
            loadInitialMessages()
            fetchConnectivity()
        }
    }, [user])

    useEffect(() => {
        // Only auto-scroll if not loading history
        if (!loadingHistory) {
            scrollToBottom()
        }
    }, [messages])

    const loadInitialMessages = async () => {
        if (!user) return

        try {
            // Fetch newest 8 messages (descending order)
            const { data, error } = await supabase
                .from('conversation')
                .select('*')
                .eq('user_id', user.id)
                .order('id', { ascending: false })
                .limit(8)

            if (error) throw error

            if (data) {
                // Reverse to show oldest first (chronological order)
                const formattedMessages = data.reverse().map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.message,
                    timestamp: new Date(msg.created_at)
                }))

                setMessages(formattedMessages)

                if (data.length > 0) {
                    // After reverse, first element is the oldest
                    setOldestMessageId(formattedMessages[0].id)
                    setHasMore(data.length === 8)
                } else {
                    setHasMore(false)
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error)
        }
    }

    const loadMoreMessages = async () => {
        if (!user || !oldestMessageId || loadingHistory) return

        setLoadingHistory(true)
        const previousScrollHeight = messagesContainerRef.current?.scrollHeight

        try {
            // Fetch older messages (descending order)
            const { data, error } = await supabase
                .from('conversation')
                .select('*')
                .eq('user_id', user.id)
                .lt('id', oldestMessageId)
                .order('id', { ascending: false })
                .limit(8)

            if (error) throw error

            if (data && data.length > 0) {
                // Reverse to show oldest first
                const formattedMessages = data.reverse().map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.message,
                    timestamp: new Date(msg.created_at)
                }))

                // Prepend older messages
                setMessages(prev => [...formattedMessages, ...prev])
                // After reverse, first element is the oldest
                setOldestMessageId(formattedMessages[0].id)
                setHasMore(data.length === 8)

                // Maintain scroll position
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        const newScrollHeight = messagesContainerRef.current.scrollHeight
                        messagesContainerRef.current.scrollTop = newScrollHeight - previousScrollHeight
                    }
                }, 0)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error('Error loading more messages:', error)
        } finally {
            setLoadingHistory(false)
        }
    }

    const fetchConnectivity = async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('profile')
                .select('connectivity')
                .eq('user_id', user.id)
                .single()

            if (data && !error) {
                setConnectivity(data.connectivity)
            }
        } catch (error) {
            console.error('Error fetching connectivity:', error)
        }
    }

    const handleSendMessage = async (content) => {
        if (!user) return

        // Create user message object for immediate display
        const tempUserMessage = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date()
        }

        // Add to UI immediately
        setMessages(prev => [...prev, tempUserMessage])
        setLoading(true)

        try {
            // Send to N8N webhook (prod or test based on environment)
            // N8N will handle saving to database
            const webhookUrl = environment === 'prod'
                ? import.meta.env.VITE_AVAGENC_N8N_WEBHOOK_PROD_URL
                : import.meta.env.VITE_AVAGENC_N8N_WEBHOOK_TEST_URL
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content,
                    user_id: user.id,
                    connectivity: connectivity
                })
            })

            const data = await response.json()

            // N8N returns an array, get the first element
            const assistantData = Array.isArray(data) ? data[0] : data

            // Add assistant message from N8N response
            const assistantMessage = {
                id: `temp-assistant-${Date.now()}`,
                role: assistantData.role || 'assistant',
                content: assistantData.message || 'I apologize, but I encountered an error.',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error('Error sending message:', error)

            // Remove the temp user message on error
            setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id))

            // Show error message
            const errorMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await signOut()
    }

    return (
        <div className="h-screen flex">
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ duration: 0.3 }}
                        className="fixed md:relative w-64 h-full glass-card border-r border-white/10 z-40"
                    >
                        <div className="p-4 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <img src="/avagenc.png" alt="Avagenc Logo" className="w-6 h-6" />
                                    <span className="font-bold text-xl gradient-text">Avagenc</span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="md:hidden text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-2">
                                <Link to="/dashboard">
                                    <Button variant="ghost" className="w-full justify-start">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Link to="/chat">
                                    <Button variant="secondary" className="w-full justify-start">
                                        Chat
                                    </Button>
                                </Link>
                                <Link to="/dashboard/services">
                                    <Button variant="ghost" className="w-full justify-start">
                                        Services
                                    </Button>
                                </Link>
                                <Link to="/dashboard/billing">
                                    <Button variant="ghost" className="w-full justify-start">
                                        Billing
                                    </Button>
                                </Link>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <div className="mb-4 px-3">
                                    <p className="text-sm text-gray-400">Logged in as</p>
                                    <p className="text-sm text-white truncate">{user?.email}</p>
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="glass border-b border-white/10 p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="text-gray-400 hover:text-white"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-white">AI Assistant</h1>
                                <p className="text-sm text-gray-400">Powered by advanced AI models</p>
                            </div>
                        </div>

                        {/* Environment Toggle */}
                        <div className="flex items-center gap-2 glass-card px-3 py-2 rounded-lg">
                            <button
                                onClick={() => setEnvironment('test')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${environment === 'test'
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <FlaskConical className="w-4 h-4" />
                                <span className="text-sm font-medium hidden sm:inline">Test</span>
                            </button>
                            <button
                                onClick={() => setEnvironment('prod')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${environment === 'prod'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Rocket className="w-4 h-4" />
                                <span className="text-sm font-medium hidden sm:inline">Prod</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto scrollbar-thin p-4"
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center max-w-md">
                                <img src="/avagenc.png" alt="Avagenc" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                                <h2 className="text-2xl font-semibold text-white mb-2">
                                    Welcome to Avagenc AI
                                </h2>
                                <p className="text-gray-400">
                                    Start a conversation with your AI assistant. Ask anything!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            {/* Load More Button */}
                            {hasMore && !loadingHistory && (
                                <div className="flex justify-center mb-6">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={loadMoreMessages}
                                        className="gap-2"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                        Load More Messages
                                    </Button>
                                </div>
                            )}

                            {/* Loading History Indicator */}
                            {loadingHistory && (
                                <div className="flex justify-center mb-6">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm">Loading messages...</span>
                                    </div>
                                </div>
                            )}

                            {/* Messages */}
                            <div className="space-y-6">
                                {messages.map((message) => (
                                    <Message key={message.id} message={message} />
                                ))}
                            </div>

                            {/* Loading Indicator */}
                            {loading && (
                                <div className="flex items-start gap-4 mt-6">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center flex-shrink-0">
                                        <img src="/avagenc.png" alt="AI" className="w-4 h-4" />
                                    </div>
                                    <div className="glass-card p-4 flex-1">
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="glass border-t border-white/10 p-4">
                    <div className="max-w-4xl mx-auto">
                        <ChatInput onSend={handleSendMessage} disabled={loading} />
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 md:hidden z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}


