import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import Navbar from '../components/Navbar'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Shield, Cpu, Mail, MessageSquare, Calendar } from 'lucide-react'

export default function Landing() {
    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-pulse-glow">
                            <img src="/avagenc.png" alt="Avagenc" className="w-5 h-5" />
                            <span className="text-sm text-white">Cutting-Edge AI Assistant</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                            <span className="gradient-text">AI Assistant</span>
                            <br />
                            <span className="text-white">That Works For You</span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                            Avagenc menghadirkan asisten AI terdepan yang terintegrasi dengan layanan favorit Anda.
                            Otomasi tugas, tingkatkan produktivitas, dan raih lebih banyak.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup">
                                <Button size="lg" className="text-lg px-8">
                                    Get Started Free
                                    <Sparkles className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <a href="#how-to-use">
                                <Button size="lg" variant="outline" className="text-lg px-8">
                                    Learn More
                                </Button>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* How to Use Section */}
            <section id="how-to-use" className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">How It Works</span>
                        </h2>
                        <p className="text-gray-400 text-lg">Mulai gunakan AI assistant dalam 3 langkah mudah</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <MessageSquare className="w-12 h-12" />,
                                title: '1. Sign Up & Chat',
                                description: 'Buat akun dan mulai berinteraksi dengan AI assistant kami melalui chat interface yang intuitif'
                            },
                            {
                                icon: <Mail className="w-12 h-12" />,
                                title: '2. Connect Services',
                                description: 'Hubungkan layanan seperti Gmail, Calendar, dan lainnya untuk memberikan AI akses ke tool yang Anda butuhkan'
                            },
                            {
                                icon: <Zap className="w-12 h-12" />,
                                title: '3. Automate & Scale',
                                description: 'Biarkan AI menangani tugas repetitif dan fokus pada pekerjaan yang lebih penting'
                            }
                        ].map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                viewport={{ once: true }}
                            >
                                <div className="glass-card p-8 h-full hover:scale-105 transition-transform duration-300">
                                    <div className="text-white mb-4">{step.icon}</div>
                                    <h3 className="text-2xl font-semibold mb-3 text-white">{step.title}</h3>
                                    <p className="text-gray-400">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-bold mb-6 text-white">
                                Powerful Features,<br />
                                <span className="gradient-text">Simple Interface</span>
                            </h2>
                            <div className="space-y-6">
                                {[
                                    { icon: <Cpu />, title: 'Advanced AI', desc: 'Model AI terbaru dan terkuat' },
                                    { icon: <Shield />, title: 'Secure & Private', desc: 'Data Anda terenkripsi dan aman' },
                                    { icon: <Zap />, title: 'Pay As You Go', desc: 'Bayar hanya untuk yang Anda gunakan' }
                                ].map((feature, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center text-white">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-white mb-1">{feature.title}</h3>
                                            <p className="text-gray-400">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="glass-card p-8 md:p-12"
                        >
                            <div className="aspect-square rounded-2xl bg-gradient-to-br from-white/20 to-gray-400/20 flex items-center justify-center">
                                <img src="/avagenc.png" alt="Avagenc Logo" className="w-32 h-32 animate-pulse" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">Simple Pricing</span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-12">Pay only for what you use. No hidden fees.</p>

                        <div className="glass-card p-12 max-w-md mx-auto">
                            <h3 className="text-3xl font-bold text-white mb-4">Pay As You Go</h3>
                            <div className="mb-6">
                                <span className="text-5xl font-bold gradient-text">Flexible</span>
                            </div>
                            <p className="text-gray-400 mb-8">
                                Top up saldo Anda dan bayar sesuai penggunaan. Token digunakan berdasarkan model AI dan fitur yang Anda aktifkan.
                            </p>
                            <Link to="/signup">
                                <Button size="lg" className="w-full">
                                    Start Now
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-text">Get In Touch</span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-8">
                            Ada pertanyaan? Tim kami siap membantu Anda
                        </p>

                        <div className="glass-card p-8 inline-block">
                            <Mail className="w-12 h-12 text-white mx-auto mb-4" />
                            <a href="mailto:support@avagenc.com" className="text-xl text-white hover:text-white">
                                support@avagenc.com
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-white/10">
                <div className="max-w-6xl mx-auto text-center text-gray-400">
                    <p>&copy; 2026 Avagenc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}


