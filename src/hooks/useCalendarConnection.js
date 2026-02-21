import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export const useCalendarConnection = () => {
    const { user } = useAuth()
    const [connection, setConnection] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchConnection()
    }, [user])

    const fetchConnection = async () => {
        if (!user) return

        setLoading(true)
        const { data } = await supabase
            .from('calendar_connect')
            .select('*')
            .eq('user_id', user.id)
            .single()

        setConnection(data)
        setLoading(false)
    }

    const connect = async () => {
        if (!user) return { error: 'User not authenticated' }

        // Get OAuth URL
        const clientId = import.meta.env.VITE_CALENDAR_PROJECT_ID
        const redirectUri = `${window.location.origin}/auth/callback/calendar`

        // Hardcoded scopes for Calendar: read, write, and modify
        const selectedScopes = 'https://www.googleapis.com/auth/calendar'

        // Add email scope to get the user's email address
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(selectedScopes + ' https://www.googleapis.com/auth/userinfo.email')}&access_type=offline&prompt=consent`

        window.location.href = googleAuthUrl
    }

    const disconnect = async () => {
        if (!user) return { error: 'User not authenticated' }

        const { error } = await supabase
            .from('calendar_connect')
            .delete()
            .eq('user_id', user.id)

        if (!error) {
            setConnection(null)
        }

        return { error }
    }

    return {
        connection,
        loading,
        connect,
        disconnect,
        refetch: fetchConnection
    }
}
