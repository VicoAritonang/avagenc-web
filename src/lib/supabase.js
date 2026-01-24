import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_AVAGENC_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_AVAGENC_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Environment check:', {
        url: supabaseUrl ? 'Found' : 'Missing',
        key: supabaseKey ? 'Found' : 'Missing',
        allEnvVars: import.meta.env
    })
    throw new Error(`Missing Supabase environment variables - URL: ${!supabaseUrl ? 'MISSING' : 'OK'}, Key: ${!supabaseKey ? 'MISSING' : 'OK'}`)
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storageKey: 'avagenc-auth-token',
        storage: window.localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})
