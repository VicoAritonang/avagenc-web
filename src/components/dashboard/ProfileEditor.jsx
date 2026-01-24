import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../hooks/useProfile'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import ImageCropDialog from './ImageCropDialog'
import { Camera, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProfileEditor() {
    const { user } = useAuth()
    const { profile, updateProfile } = useProfile()
    const [name, setName] = useState(profile?.name || '')
    const [about, setAbout] = useState(profile?.about || '')
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [notification, setNotification] = useState(null)
    const [showCropDialog, setShowCropDialog] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)

    // Update local state when profile loads
    useState(() => {
        if (profile) {
            setName(profile.name || '')
            setAbout(profile.about || '')
        }
    }, [profile])

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setNotification({ type: 'error', message: 'Please select an image file' })
            return
        }

        // Validate file size (max 10MB for original file)
        if (file.size > 10 * 1024 * 1024) {
            setNotification({ type: 'error', message: 'Image size must be less than 10MB' })
            return
        }

        // Read file and show crop dialog
        const reader = new FileReader()
        reader.onload = () => {
            setSelectedImage(reader.result)
            setShowCropDialog(true)
        }
        reader.readAsDataURL(file)
    }

    const handleCropComplete = async (croppedBlob) => {
        setShowCropDialog(false)
        setUploading(true)
        setNotification(null)

        try {
            // Create FormData with cropped and compressed image
            const formData = new FormData()
            formData.append('file', croppedBlob, 'profile.jpg')
            formData.append('user_id', user.id)

            // Upload to N8N
            const webhookUrl = import.meta.env.VITE_N8N_IMAGE_TO_URL
            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData
            })

            const result = await response.text()

            if (result.toLowerCase().includes('success')) {
                setNotification({ type: 'success', message: 'Image uploaded successfully!' })
                // Reload page to fetch new image_url
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            } else {
                setNotification({ type: 'error', message: 'Image upload failed. Please try again.' })
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            setNotification({ type: 'error', message: 'Failed to upload image. Please try again.' })
        } finally {
            setUploading(false)
            setSelectedImage(null)
        }
    }

    const handleSaveProfile = async () => {
        setSaving(true)
        setNotification(null)

        const { error } = await updateProfile({
            name: name.trim(),
            about: about.trim()
        })

        if (error) {
            setNotification({ type: 'error', message: 'Failed to save profile' })
        } else {
            setNotification({ type: 'success', message: 'Profile saved successfully!' })
        }

        setSaving(false)
    }

    return (
        <Card>
            <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-white mb-6">Profile Settings</h2>

                {/* Notification */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${notification.type === 'success'
                                ? 'bg-green-500/20 border border-green-500/50'
                                : 'bg-red-500/20 border border-red-500/50'
                                }`}
                        >
                            {notification.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-400" />
                            )}
                            <p className={notification.type === 'success' ? 'text-green-300' : 'text-red-300'}>
                                {notification.message}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-6">
                    {/* Profile Image */}
                    <div>
                        <Label className="text-white mb-3 block">Profile Picture</Label>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                {profile?.image_url ? (
                                    <img
                                        src={profile.image_url}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover border-2 border-slate-500"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                                        <Camera className="w-10 h-10 text-slate-400" />
                                    </div>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    id="profile-image"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    disabled={uploading}
                                    className="hidden"
                                />
                                <label htmlFor="profile-image">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={uploading}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            document.getElementById('profile-image').click()
                                        }}
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="w-4 h-4 mr-2" />
                                                Change Photo
                                            </>
                                        )}
                                    </Button>
                                </label>
                                <p className="text-xs text-gray-400 mt-2">
                                    Max 10MB. JPG, PNG, or GIF. Will be cropped to 1:1 ratio.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <Label htmlFor="name" className="text-white">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="mt-2"
                        />
                    </div>

                    {/* About */}
                    <div>
                        <Label htmlFor="about" className="text-white">About</Label>
                        <textarea
                            id="about"
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            placeholder="Tell us about yourself..."
                            rows={4}
                            className="w-full mt-2 resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-transparent backdrop-blur-sm transition-all scrollbar-thin"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSaveProfile}
                            disabled={saving || uploading}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Profile'
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>

            {/* Image Crop Dialog */}
            <ImageCropDialog
                open={showCropDialog}
                onOpenChange={setShowCropDialog}
                imageSrc={selectedImage}
                onCropComplete={handleCropComplete}
            />
        </Card>
    )
}
