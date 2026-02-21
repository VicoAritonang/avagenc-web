import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, AlertCircle, Settings2, Trash2, Mail, Users, MessageSquare, Plus, Activity } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useGmailConnection } from '../../hooks/useGmailConnection'
import { useCalendarConnection } from '../../hooks/useCalendarConnection'
import GmailOAuth from '../../components/services/GmailOAuth'
import DisconnectDialog from '../../components/services/DisconnectDialog'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ServiceDetail() {
    const { serviceName } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    // States
    const [service, setService] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isConnecting, setIsConnecting] = useState(false)
    const [isDisconnecting, setIsDisconnecting] = useState(false)
    const [showGmailDialog, setShowGmailDialog] = useState(false)
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)

    // Connections
    const { connection: gmailConnection, connect: connectGmail, disconnect: disconnectGmail, refetch: refetchGmail } = useGmailConnection()
    const { connection: calendarConnection, connect: connectCalendar, disconnect: disconnectCalendar, refetch: refetchCalendar } = useCalendarConnection()

    useEffect(() => {
        fetchServiceDetails()
    }, [serviceName, gmailConnection, calendarConnection])

    const fetchServiceDetails = async () => {
        setLoading(true)
        if (!serviceName) {
            setLoading(false)
            return
        }
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .ilike('name', serviceName)
                .single()

            if (error) {
                throw error
            }
            setService(data)
        } catch (error) {
            console.error('Error fetching service:', error)
            toast.error('Failed to load service details.')
        } finally {
            setLoading(false)
        }
    }

    const isConnected =
        (serviceName?.toLowerCase() === 'gmail' && gmailConnection) ||
        (serviceName?.toLowerCase() === 'calendar' && calendarConnection)

    const handleConnectClick = () => {
        if (serviceName?.toLowerCase() === 'gmail') {
            localStorage.setItem('gmail_return_to', '/dashboard/services/' + serviceName)
            setShowGmailDialog(true)
        } else if (serviceName?.toLowerCase() === 'calendar') {
            localStorage.setItem('calendar_return_to', '/dashboard/services/' + serviceName)
            connectCalendar()
        }
    }

    const handleDisconnectClick = () => { // Changed to not be async directly
        setShowDisconnectDialog(true)
    }

    const confirmDisconnect = async () => { // New function for confirmation
        setIsDisconnecting(true)
        try {
            if (serviceName?.toLowerCase() === 'gmail') {
                await disconnectGmail()
                refetchGmail()
            } else if (serviceName?.toLowerCase() === 'calendar') {
                await disconnectCalendar()
                refetchCalendar()
            }
            toast.success('Successfully disconnected ' + service.name)
        } catch (error) {
            toast.error('Failed to disconnect ' + service.name)
        } finally {
            setIsDisconnecting(false)
            setShowDisconnectDialog(false)
        }
    }

    const handleGmailConnect = (scopes) => {
        setShowGmailDialog(false)
        connectGmail(scopes)
    }

    // Convert YouTube URL to embed format
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null

        // Handle youtube.com/watch?v=VIDEO_ID
        const watchMatch = url.match(/[?&]v=([^&]+)/)
        if (watchMatch) {
            return 'https://www.youtube.com/embed/' + watchMatch[1]
        }

        // Handle youtu.be/VIDEO_ID
        const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
        if (shortMatch) {
            return 'https://www.youtube.com/embed/' + shortMatch[1]
        }

        // If already embed URL, return as is
        if (url.includes('/embed/')) {
            return url
        }

        return null
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Service not found</p>
                    <Button onClick={() => navigate('/dashboard/services')}>
                        Back to Services
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard/services')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Services
                </Button>

                {/* Header with Status */}
                <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{service.name}</h1>

                        <div className="flex items-center gap-2 mt-2">
                            {isConnected ? (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm text-green-400 font-medium">Connected</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-500/10 border border-gray-500/20">
                                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                                    <span className="text-sm text-gray-400 font-medium">Not Connected</span>
                                </div>
                            )}
                            {serviceName?.toLowerCase() === 'gmail' && gmailConnection?.gmail && (
                                <>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-gray-400">{gmailConnection.gmail}</span>
                                </>
                            )}
                            {serviceName?.toLowerCase() === 'calendar' && calendarConnection?.gmail && (
                                <>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-gray-400">{calendarConnection.gmail}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Connect/Disconnect Button */}
                    {isConnected ? (
                        <Button variant="destructive" onClick={handleDisconnectClick} disabled={isDisconnecting}>
                            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                        </Button>
                    ) : (
                        <Button onClick={handleConnectClick}>
                            Connect {service.name}
                        </Button>
                    )}
                </div>

                {/* Service Image/Video */}
                <Card>
                    <CardContent className="p-0">
                        {service.video_url ? (
                            // 16:9 Aspect Ratio Container for YouTube
                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                    src={getYouTubeEmbedUrl(service.video_url)}
                                    title={service.name}
                                    className="absolute top-0 left-0 w-full h-full rounded-t-2xl"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : service.image_url ? (
                            <div className="relative h-96 bg-gradient-to-br from-white/20 to-gray-400/20 rounded-t-2xl overflow-hidden">
                                <img
                                    src={service.image_url}
                                    alt={service.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="relative h-96 bg-gradient-to-br from-white/20 to-gray-400/20 rounded-t-2xl overflow-hidden flex items-center justify-center">
                                <span className="text-9xl">📧</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Description */}
                {service.description && (
                    <Card>
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-semibold text-white mb-4">About {service.name}</h2>
                            <div className="text-gray-300 space-y-4 leading-relaxed">
                                {service.description.split('\n\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Connected Scopes (if Gmail is connected) */}
                {isConnected && gmailConnection?.scope && (
                    <Card>
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-semibold text-white mb-4">Granted Permissions</h2>
                            <div className="flex flex-wrap gap-2">
                                {gmailConnection.scope.split(';').filter(Boolean).map((scope) => {
                                    const scopeColors = {
                                        read: 'bg-blue-500/80',
                                        label: 'bg-yellow-500/80',
                                        send: 'bg-green-500/80'
                                    }
                                    return (
                                        <span
                                            key={scope}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium ${scopeColors[scope] || 'bg-gray-500/80'}`}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="capitalize">{scope}</span>
                                        </span>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </motion.div>

            {/* Gmail OAuth Dialog */}
            <GmailOAuth
                open={showGmailDialog}
                onOpenChange={setShowGmailDialog}
                onConnect={handleGmailConnect}
            />

            {/* Disconnect Confirmation Dialog */}
            <DisconnectDialog
                open={showDisconnectDialog}
                onOpenChange={setShowDisconnectDialog}
                onConfirm={confirmDisconnect}
                serviceName={service?.name || 'Service'}
            />
        </div>
    )
}
