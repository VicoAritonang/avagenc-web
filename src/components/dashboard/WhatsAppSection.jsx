import { useState } from 'react'
import { useWhatsApp } from '../../hooks/useWhatsApp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { MessageCircle, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function WhatsAppSection() {
    const { whatsapp, loading, registerWhatsApp } = useWhatsApp()
    const [phoneNumber, setPhoneNumber] = useState('')
    const [registering, setRegistering] = useState(false)
    const [notification, setNotification] = useState(null)

    const handleRegister = async () => {
        // Validate phone number
        if (!phoneNumber.trim()) {
            setNotification({ type: 'error', message: 'Please enter your WhatsApp number' })
            return
        }

        // Clean phone number (remove spaces, dashes, etc)
        const cleanNumber = phoneNumber.replace(/\D/g, '')

        if (cleanNumber.length < 10) {
            setNotification({ type: 'error', message: 'Please enter a valid phone number' })
            return
        }

        setRegistering(true)
        setNotification(null)

        const { success, error } = await registerWhatsApp(cleanNumber)

        if (success) {
            setNotification({ type: 'success', message: 'WhatsApp registered successfully!' })
            // Reload page after 1.5 seconds
            setTimeout(() => {
                window.location.reload()
            }, 1500)
        } else {
            setNotification({ type: 'error', message: error || 'Failed to register WhatsApp' })
        }

        setRegistering(false)
    }

    const handleContactAssistant = () => {
        if (whatsapp?.assistant_number) {
            // Open WhatsApp chat with assistant
            const whatsappUrl = `https://wa.me/${whatsapp.assistant_number}`
            window.open(whatsappUrl, '_blank')
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-400" />
                    WhatsApp Assistant
                </CardTitle>
                <CardDescription>
                    {whatsapp
                        ? 'Your WhatsApp is connected to Avagenc AI Assistant'
                        : 'Connect your WhatsApp to chat with Avagenc AI Assistant'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Notification */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${notification.type === 'success'
                                    ? 'bg-green-500/20 border border-green-500/50'
                                    : 'bg-red-500/20 border border-red-500/50'
                                }`}
                        >
                            {notification.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-400" />
                            )}
                            <p className={notification.type === 'success' ? 'text-green-300 text-sm' : 'text-red-300 text-sm'}>
                                {notification.message}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {whatsapp ? (
                    /* Registered - Show Contact Button */
                    <div className="space-y-4">
                        <div className="glass-card p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Your Number</p>
                                    <p className="text-white font-medium">+{whatsapp.user_number}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={handleContactAssistant}
                            className="w-full"
                            size="lg"
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Chat with AI Assistant on WhatsApp
                        </Button>
                    </div>
                ) : (
                    /* Not Registered - Show Registration Form */
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="whatsapp" className="text-white">WhatsApp Number</Label>
                            <Input
                                id="whatsapp"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="e.g., 628123456789"
                                className="mt-2"
                                disabled={registering}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Enter your WhatsApp number with country code (without +)
                            </p>
                        </div>
                        <Button
                            onClick={handleRegister}
                            disabled={registering}
                            className="w-full"
                            size="lg"
                        >
                            {registering ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Activating...
                                </>
                            ) : (
                                <>
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Activate WhatsApp Assistant
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
