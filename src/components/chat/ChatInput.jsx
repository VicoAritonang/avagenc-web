import { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { Send } from 'lucide-react'

export default function ChatInput({ onSend, disabled }) {
    const [value, setValue] = useState('')
    const [history, setHistory] = useState([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const textareaRef = useRef(null)

    useEffect(() => {
        adjustHeight()
    }, [value])

    const adjustHeight = () => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
        }
    }

    const handleSubmit = (e) => {
        e?.preventDefault()
        if (value.trim() && !disabled) {
            onSend(value.trim())
            setHistory(prev => [...prev, value.trim()])
            setValue('')
            setHistoryIndex(-1)
        }
    }

    const handleKeyDown = (e) => {
        // Enter to send (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }

        // Arrow up/down for history navigation (only when textarea is empty)
        if (e.key === 'ArrowUp' && value === '') {
            e.preventDefault()
            if (history.length > 0 && historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1
                setHistoryIndex(newIndex)
                setValue(history[history.length - 1 - newIndex])
            }
        }

        if (e.key === 'ArrowDown' && value === '') {
            e.preventDefault()
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1
                setHistoryIndex(newIndex)
                setValue(history[history.length - 1 - newIndex])
            } else if (historyIndex === 0) {
                setHistoryIndex(-1)
                setValue('')
            }
        }
    }

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line, Enter to send)"
                disabled={disabled}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 pl-4 pr-14 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-transparent backdrop-blur-sm transition-all"
                rows="1"
                style={{
                    maxHeight: '200px',
                    minHeight: '52px',
                    overflowY: 'hidden',
                    display: 'block'
                }}
            />
            <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 10 }}>
                <Button
                    type="button"
                    size="icon"
                    disabled={!value.trim() || disabled}
                    onClick={handleSubmit}
                    className="h-9 w-9"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
