// Get required credentials from env
const GMAIL_CLIENT_ID = process.env.VITE_GMAIL_PROJECT_ID;
const GMAIL_CLIENT_SECRET = process.env.VITE_GMAIL_PROJECT_SECRET;
const CALENDAR_CLIENT_ID = process.env.VITE_CALENDAR_PROJECT_ID;
const CALENDAR_CLIENT_SECRET = process.env.VITE_CALENDAR_PROJECT_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code, redirect_uri, service } = req.body;

        if (!code || !redirect_uri) {
            return res.status(400).json({ error: 'Missing code or redirect_uri' });
        }

        // Determine client credentials based on service
        let clientId, clientSecret;
        if (service === 'calendar') {
            clientId = CALENDAR_CLIENT_ID;
            clientSecret = CALENDAR_CLIENT_SECRET;
        } else {
            // Default to Gmail if not specified or specified as 'gmail'
            clientId = GMAIL_CLIENT_ID;
            clientSecret = GMAIL_CLIENT_SECRET;
        }

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            }).toString()
        });

        const tokens = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Google token error:', tokens);
            throw new Error(tokens.error_description || tokens.error || 'Failed to exchange token');
        }

        return res.status(200).json(tokens);
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
