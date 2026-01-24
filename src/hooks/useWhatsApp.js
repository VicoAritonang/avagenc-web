import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export function useWhatsApp() {
    const { user } = useAuth()
    const [whatsapp, setWhatsapp] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchWhatsApp()
        }
    }, [user])

    const fetchWhatsApp = async () => {
        if (!user) return

        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('user_whatsapp')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                // PGRST116 is "not found" error, which is ok for new users
                throw error
            }

            setWhatsapp(data)
        } catch (error) {
            console.error('Error fetching WhatsApp:', error)
        } finally {
            setLoading(false)
        }
    }

    const registerWhatsApp = async (phoneNumber) => {
        if (!user) return { error: 'No user logged in' }

        try {
            // Send to N8N webhook
            const webhookUrl = import.meta.env.VITE_AVAGENC_WHATSAPP
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: user.id,
                    user_number: phoneNumber
                })
            })

            const result = await response.text()

            if (result.toLowerCase().includes('success')) {
                return { success: true, error: null }
            } else {
                return { success: false, error: 'Registration failed' }
            }
        } catch (error) {
            console.error('Error registering WhatsApp:', error)
            return { success: false, error: error.message }
        }
    }

    return {
        whatsapp,
        loading,
        fetchWhatsApp,
        registerWhatsApp
    }
}
