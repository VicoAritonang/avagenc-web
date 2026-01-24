import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export const useGmailConnection = () => {
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
            .from('gmail_connect')
            .select('*')
            .eq('user_id', user.id)
            .single()

        setConnection(data)
        setLoading(false)
    }

    const connect = async (scopes) => {
        if (!user) return { error: 'User not authenticated' }

        // Store selected scopes in localStorage for callback
        localStorage.setItem('gmail_scopes', scopes.join(';'))

        // Get OAuth URL
        const clientId = import.meta.env.VITE_GMAIL_PROJECT_ID
        const redirectUri = `${window.location.origin}/auth/callback/gmail`

        // Map scopes to Gmail API scopes
        const scopeMap = {
            'read': 'https://www.googleapis.com/auth/gmail.readonly',
            'label': 'https://www.googleapis.com/auth/gmail.modify',
            'send': 'https://www.googleapis.com/auth/gmail.send'
        }

        const selectedScopes = scopes.map(s => scopeMap[s]).join(' ')
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(selectedScopes + ' https://www.googleapis.com/auth/userinfo.email')}&access_type=offline&prompt=consent`

        window.location.href = googleAuthUrl
    }

    const disconnect = async () => {
        if (!user) return { error: 'User not authenticated' }

        const { error } = await supabase
            .from('gmail_connect')
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
