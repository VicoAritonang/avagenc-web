import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { motion } from 'framer-motion'
import { ExternalLink, CheckCircle, Circle } from 'lucide-react'

export default function ServiceCard({ service, connection, onConnect, onDisconnect, onViewDetail }) {
    const isConnected = !!connection

    // Parse scopes from connection
    const activeScopes = connection?.scope ? connection.scope.split(';').filter(Boolean) : []

    // Scope badge colors
    const scopeColors = {
        read: 'bg-blue-500/80',
        label: 'bg-yellow-500/80',
        send: 'bg-green-500/80'
    }

    const handleCardClick = (e) => {
        // Don't trigger if clicking buttons
        if (e.target.closest('button')) return
        onViewDetail()
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="group relative cursor-pointer"
            onClick={handleCardClick}
        >
            <Card className="overflow-hidden h-full">
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-white/20 to-gray-400/20">
                    {service.image_url ? (
                        <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl">📧</span>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                        {isConnected ? (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
                                <CheckCircle className="w-4 h-4 text-white" />
                                <span className="text-xs font-medium text-white">Connected</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-500/90 backdrop-blur-sm">
                                <Circle className="w-4 h-4 text-white" />
                                <span className="text-xs font-medium text-white">Available</span>
                            </div>
                        )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                onViewDetail()
                            }}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Detail
                        </Button>
                        {isConnected ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDisconnect()
                                }}
                            >
                                Disconnect
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onConnect()
                                }}
                            >
                                Connect
                            </Button>
                        )}
                    </div>
                </div>

                {/* Service Info */}
                <div className="p-4">
                    <h3 className="text-xl font-semibold text-white mb-2">{service.name}</h3>
                    {isConnected && connection?.gmail && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="truncate">{connection.gmail}</span>
                            </div>
                            {/* Active Scopes Badges */}
                            {activeScopes.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {activeScopes.map(scope => (
                                        <span
                                            key={scope}
                                            className={`text-xs px-2.5 py-1 rounded-full text-white font-medium ${scopeColors[scope] || 'bg-gray-500/80'}`}
                                        >
                                            {scope}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {!isConnected && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                            {service.description?.substring(0, 100)}...
                        </p>
                    )}
                </div>
            </Card>
        </motion.div>
    )
}
