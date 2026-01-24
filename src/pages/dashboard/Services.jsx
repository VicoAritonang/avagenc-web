import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useGmailConnection } from '../../hooks/useGmailConnection'
import ServiceCard from '../../components/dashboard/ServiceCard'
import GmailOAuth from '../../components/services/GmailOAuth'
import DisconnectDialog from '../../components/services/DisconnectDialog'
import { motion } from 'framer-motion'
import { Sparkles, CheckCircle } from 'lucide-react'

export default function Services() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [services, setServices] = useState([])
    const [activeServices, setActiveServices] = useState([])
    const [availableServices, setAvailableServices] = useState([])
    const [showGmailDialog, setShowGmailDialog] = useState(false)
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
    const [selectedService, setSelectedService] = useState(null)
    const { connection: gmailConnection, connect: connectGmail, disconnect: disconnectGmail, refetch } = useGmailConnection()

    useEffect(() => {
        fetchServices()
    }, [gmailConnection])

    const fetchServices = async () => {
        // Fetch all services
        const { data: servicesData } = await supabase
            .from('services')
            .select('*')
            .order('name')

        if (servicesData) {
            setServices(servicesData)

            // Separate active and available services
            const active = []
            const available = []

            servicesData.forEach(service => {
                if (service.name.toLowerCase() === 'gmail' && gmailConnection) {
                    active.push({ ...service, connection: gmailConnection })
                } else if (service.name.toLowerCase() === 'gmail' && !gmailConnection) {
                    available.push({ ...service, connection: null })
                } else {
                    // For future services
                    available.push({ ...service, connection: null })
                }
            })

            setActiveServices(active)
            setAvailableServices(available)
        }
    }

    const handleConnect = (service) => {
        if (service.name.toLowerCase() === 'gmail') {
            localStorage.setItem('gmail_return_to', '/dashboard/services')
            setShowGmailDialog(true)
        }
    }

    const handleDisconnect = async (service) => {
        setSelectedService(service)
        setShowDisconnectDialog(true)
    }

    const confirmDisconnect = async () => {
        if (selectedService?.name.toLowerCase() === 'gmail') {
            await disconnectGmail()
            refetch()
        }
        setSelectedService(null)
    }

    const handleViewDetail = (service) => {
        navigate(`/dashboard/services/${service.name.toLowerCase()}`)
    }

    const handleGmailConnect = (scopes) => {
        setShowGmailDialog(false)
        connectGmail(scopes)
    }

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-white mb-2">Services</h1>
                <p className="text-gray-400">Connect and manage your external services</p>
            </motion.div>

            {/* Active Services */}
            {activeServices.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <h2 className="text-2xl font-semibold text-white">Active Services</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                connection={service.connection}
                                onConnect={() => handleConnect(service)}
                                onDisconnect={() => handleDisconnect(service)}
                                onViewDetail={() => handleViewDetail(service)}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Available Services */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-gray-400" />
                    <h2 className="text-2xl font-semibold text-white">
                        {activeServices.length > 0 ? 'Available Services' : 'All Services'}
                    </h2>
                </div>
                {availableServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                connection={service.connection}
                                onConnect={() => handleConnect(service)}
                                onDisconnect={() => handleDisconnect(service)}
                                onViewDetail={() => handleViewDetail(service)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400">All available services are connected!</p>
                    </div>
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
                serviceName={selectedService?.name || 'Service'}
            />
        </div>
    )
}


