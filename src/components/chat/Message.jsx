import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Sparkles, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { formatDate } from '../../lib/utils'

export default function Message({ message }) {
    const [copied, setCopied] = useState(false)
    const isUser = message.role === 'user'

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
        >
            {/* Avatar */}
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                    : 'bg-gradient-to-br from-slate-600 to-slate-700'
                    }`}
            >
                {isUser ? (
                    <User className="w-4 h-4 text-white" />
                ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : ''} group relative`}>
                <div
                    className={`glass-card p-4 relative ${isUser
                        ? 'bg-gradient-to-br from-blue-600/20 to-cyan-600/15 border-blue-500/30'
                        : 'bg-gradient-to-br from-slate-700/30 to-slate-800/30 border-slate-600/30'
                        }`}
                >
                    <div className="prose prose-invert max-w-none">
                        {isUser ? (
                            <p className="text-white m-0 whitespace-pre-wrap">{message.content}</p>
                        ) : (
                            <div className="text-gray-200">
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-200">{children}</p>,
                                        code: ({ inline, children }) =>
                                            inline ? (
                                                <code className="bg-white/10 px-1.5 py-0.5 rounded text-white">
                                                    {children}
                                                </code>
                                            ) : (
                                                <code className="block bg-white/10 p-3 rounded-lg my-2 overflow-x-auto text-gray-200">
                                                    {children}
                                                </code>
                                            ),
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>

                {/* Copy Button */}
                <button
                    onClick={handleCopy}
                    className={`absolute ${isUser ? '-left-10 top-2' : '-right-10 top-2'} p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100`}
                    title="Copy response"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                    ) : (
                        <Copy className="w-4 h-4" />
                    )}
                </button>

                <p className={`text-xs text-gray-500 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {formatDate(message.timestamp)}
                </p>
            </div>
        </motion.div>
    )
}


