import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function GmailCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(() => {
        if (user) {
            handleCallback()
        }
    }, [user])

    const handleCallback = async () => {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error || !code) {
            console.error('OAuth error:', error)
            navigate('/dashboard/services?error=oauth_failed')
            return
        }

        try {
            // Exchange code for tokens
            const clientId = import.meta.env.VITE_GMAIL_PROJECT_ID
            const clientSecret = import.meta.env.VITE_GMAIL_PROJECT_SECRET
            const redirectUri = `${window.location.origin}/auth/callback/gmail`

            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code'
                })
            })

            const tokens = await tokenResponse.json()

            if (!tokens.refresh_token) {
                throw new Error('No refresh token received')
            }

            // Get user email from Google
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`
                }
            })
            const userInfo = await userInfoResponse.json()

            // Get scopes from localStorage
            const scopes = localStorage.getItem('gmail_scopes') || 'read'
            localStorage.removeItem('gmail_scopes')

            // Save to database
            const { error: dbError } = await supabase
                .from('gmail_connect')
                .upsert({
                    user_id: user.id,
                    gmail: userInfo.email,
                    refresh_token: tokens.refresh_token,
                    scope: scopes,
                    created_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })

            if (dbError) throw dbError

            // Redirect back to services
            const returnTo = localStorage.getItem('gmail_return_to') || '/dashboard/services'
            localStorage.removeItem('gmail_return_to')
            navigate(returnTo + '?connected=gmail')
        } catch (error) {
            console.error('Error handling OAuth callback:', error)
            navigate('/dashboard/services?error=connection_failed')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Connecting your Gmail account...</p>
            </div>
        </div>
    )
}


