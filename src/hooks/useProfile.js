import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export function useProfile() {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchProfile()
        }
    }, [user])

    const fetchProfile = async () => {
        if (!user) return

        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('profile')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                // PGRST116 is "not found" error, which is ok for new users
                throw error
            }

            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateProfile = async (updates) => {
        if (!user) return { error: 'No user logged in' }

        try {
            const { data, error } = await supabase
                .from('profile')
                .upsert({
                    user_id: user.id,
                    ...updates
                })
                .select()
                .single()

            if (error) throw error

            setProfile(data)
            return { data, error: null }
        } catch (error) {
            console.error('Error updating profile:', error)
            return { data: null, error }
        }
    }

    return {
        profile,
        loading,
        fetchProfile,
        updateProfile
    }
}
