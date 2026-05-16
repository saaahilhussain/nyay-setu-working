import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, Maximize2, Minimize2, Sparkles, Copy } from 'lucide-react';
import { vakilFriendAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CaseChatWidget({ caseId, caseTitle }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isMinimized]);

    const handleToggle = () => {
        if (!isOpen) {
            setIsOpen(true);
            if (!sessionId && !isStarting) {
                startChatSession();
            }
        } else {
            setIsOpen(!isOpen);
        }
    };

    const startChatSession = async () => {
        try {
            setIsStarting(true);
            const response = await vakilFriendAPI.startCaseSession(caseId);

            setSessionId(response.data.sessionId);

            setMessages([{
                role: 'assistant',
                content: response.data.message || `I am ready to help with case: **${caseTitle}**`
            }]);

        } catch (error) {
            console.error("Failed to start case chat:", error);
            setMessages([{
                role: 'assistant',
                content: "⚠️ Failed to connect to AI assistant. Please try again later."
            }]);
        } finally {
            setIsStarting(false);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMsg = inputMessage.trim();
        setInputMessage('');

        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await vakilFriendAPI.sendMessage(sessionId, userMsg);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.message
            }]);

        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "❌ Error sending message. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={handleToggle}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    padding: '1rem',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 9999
                }}
                title="Ask AI Assistant"
            >
                <Sparkles size={28} />
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: isMinimized ? '300px' : '400px',
            height: isMinimized ? 'auto' : '600px',
            background: 'var(--bg-glass-strong)',
            borderRadius: '1rem',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999
        }}>

            {/* HEADER */}
            <div style={{
                padding: '1rem',
                background: 'var(--color-primary)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <div>
                    <strong>Nyay Saarthi</strong>
                    <div style={{ fontSize: '0.75rem' }}>AI Case Assistant</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)}>
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* CHAT */}
            {!isMinimized && (
                <>
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {isStarting ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                        padding: '0.75rem',
                                        borderRadius: '1rem',
                                        background: msg.role === 'user' ? '#2563eb' : '#fff',
                                        color: msg.role === 'user' ? '#fff' : '#000',
                                        position: 'relative'
                                    }}
                                >
                                    {/* MESSAGE TEXT */}
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>

                                    {/* COPY BUTTON (ONLY AI) */}
                                    {msg.role === 'assistant' && (
                                        <button
                                            onClick={() => copyToClipboard(msg.content)}
                                            style={{
                                                position: 'absolute',
                                                top: 5,
                                                right: 5,
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            title="Copy"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT */}
                    <div style={{
                        padding: '1rem',
                        display: 'flex',
                        gap: '0.5rem'
                    }}>
                        <input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask about this case..."
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '0.5rem'
                            }}
                        />

                        <button onClick={sendMessage} disabled={isLoading}>
                            <Send size={18} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}