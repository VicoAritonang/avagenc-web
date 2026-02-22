import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function CalendarCallback() {
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
            const redirectUri = `${window.location.origin}/auth/callback/calendar`

            const tokenResponse = await fetch('/api/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    redirect_uri: redirectUri,
                    service: 'calendar'
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

            // Save to database
            const { error: dbError } = await supabase
                .from('calendar_connect')
                .upsert({
                    user_id: user.id,
                    gmail: userInfo.email,
                    refresh_token: tokens.refresh_token,
                    created_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })

            if (dbError) throw dbError

            // Redirect back to services
            const returnTo = localStorage.getItem('calendar_return_to') || '/dashboard/services'
            localStorage.removeItem('calendar_return_to')
            navigate(returnTo + '?connected=calendar')
        } catch (error) {
            console.error('Error handling OAuth callback:', error)
            navigate('/dashboard/services?error=connection_failed')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Connecting your Calendar account...</p>
            </div>
        </div>
    )
}
