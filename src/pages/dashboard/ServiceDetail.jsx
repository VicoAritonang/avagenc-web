import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useGmailConnection } from '../../hooks/useGmailConnection'
import GmailOAuth from '../../components/services/GmailOAuth'
import DisconnectDialog from '../../components/services/DisconnectDialog'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Circle, Mail } from 'lucide-react'

export default function ServiceDetail() {
    const { serviceName } = useParams()
    const navigate = useNavigate()
    const [service, setService] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showGmailDialog, setShowGmailDialog] = useState(false)
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
    const { connection: gmailConnection, connect: connectGmail, disconnect: disconnectGmail, refetch } = useGmailConnection()

    useEffect(() => {
        fetchService()
    }, [serviceName, gmailConnection])

    const fetchService = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('services')
            .select('*')
            .ilike('name', serviceName)
            .single()

        if (data) {
            setService(data)
        }
        setLoading(false)
    }

    const isConnected = serviceName?.toLowerCase() === 'gmail' && gmailConnection

    const handleConnect = () => {
        if (serviceName?.toLowerCase() === 'gmail') {
            localStorage.setItem('gmail_return_to', `/dashboard/services/${serviceName}`)
            setShowGmailDialog(true)
        }
    }

    const handleDisconnect = async () => {
        setShowDisconnectDialog(true)
    }

    const confirmDisconnect = async () => {
        if (serviceName?.toLowerCase() === 'gmail') {
            await disconnectGmail()
            refetch()
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
            return `https://www.youtube.com/embed/${watchMatch[1]}`
        }

        // Handle youtu.be/VIDEO_ID
        const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
        if (shortMatch) {
            return `https://www.youtube.com/embed/${shortMatch[1]}`
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
                        <h1 className="text-4xl font-bold text-white mb-2">{service.name}</h1>
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <>
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="text-green-400 font-medium">Connected</span>
                                    {gmailConnection?.gmail && (
                                        <>
                                            <span className="text-gray-600">•</span>
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-400">{gmailConnection.gmail}</span>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Circle className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-400">Not connected</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Connect/Disconnect Button */}
                    {isConnected ? (
                        <Button variant="destructive" onClick={handleDisconnect}>
                            Disconnect
                        </Button>
                    ) : (
                        <Button onClick={handleConnect}>
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
                                            <CheckCircle className="w-4 h-4" />
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


