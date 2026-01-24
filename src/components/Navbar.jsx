import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/avagenc.png" alt="Avagenc Logo" className="w-8 h-8" />
                        <span className="text-2xl font-bold gradient-text">Avagenc</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="/#how-to-use" className="text-gray-300 hover:text-white transition-colors">
                            How It Works
                        </a>
                        <a href="/#pricing" className="text-gray-300 hover:text-white transition-colors">
                            Pricing
                        </a>
                        <a href="/#contact" className="text-gray-300 hover:text-white transition-colors">
                            Contact
                        </a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link to="/signup">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}


