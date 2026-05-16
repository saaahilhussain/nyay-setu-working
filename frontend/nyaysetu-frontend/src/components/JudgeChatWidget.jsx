import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, Maximize2, Minimize2, Sparkles, Calendar, UserPlus, FileText } from 'lucide-react';
import { vakilFriendAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function JudgeChatWidget({ caseId, caseTitle, onScheduleHearing, onAddParty }) {
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
                content: `Good day, Your Honor. I'm ready to assist with **${caseTitle}**.\n\nYou can ask me about case details, schedule hearings, or add parties to the proceedings.`
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

    const handleQuickAction = (action) => {
        switch (action) {
            case 'schedule':
                setMessages(prev => [...prev, {
                    role: 'user',
                    content: 'I want to schedule the next hearing'
                }]);
                if (onScheduleHearing) onScheduleHearing();
                break;

            case 'summon':
                setMessages(prev => [...prev, {
                    role: 'user',
                    content: 'I need to add a party to this case'
                }]);
                if (onAddParty) onAddParty();
                break;

            case 'brief':
                setInputMessage('Provide a concise case brief');
                break;
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            console.log("Copied to clipboard");
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
                    boxShadow: '0 4px 20px rgba(30, 42, 68, 0.4)',
                    cursor: 'pointer',
                    zIndex: 9999
                }}
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
            width: isMinimized ? '320px' : '420px',
            height: isMinimized ? 'auto' : '650px',
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
                    <div style={{ fontWeight: 600 }}>AI Court Assistant</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Judicial Support</div>
                </div>

                <div>
                    <button onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)}>
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            {!isMinimized && (
                <div style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleQuickAction('schedule')}>
                        <Calendar size={14} /> Schedule
                    </button>
                    <button onClick={() => handleQuickAction('summon')}>
                        <UserPlus size={14} /> Add Party
                    </button>
                    <button onClick={() => handleQuickAction('brief')}>
                        <FileText size={14} /> Brief
                    </button>
                </div>
            )}

            {/* CHAT */}
            {!isMinimized && (
                <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                background: msg.role === 'user' ? 'var(--color-accent)' : 'white',
                                color: msg.role === 'user' ? 'white' : '#111',
                                padding: '0.75rem',
                                borderRadius: '1rem',
                                marginBottom: '0.5rem',
                                position: 'relative'
                            }}
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                            </ReactMarkdown>

                            {/* COPY BUTTON (ONLY ASSISTANT) */}
                            {msg.role === 'assistant' && (
                                <button
                                    onClick={() => copyToClipboard(msg.content)}
                                    style={{
                                        marginTop: '0.5rem',
                                        fontSize: '0.75rem',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666'
                                    }}
                                >
                                    📋 Copy
                                </button>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div style={{ padding: '0.5rem' }}>
                            <Loader2 size={16} />
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* INPUT */}
            {!isMinimized && (
                <div style={{ display: 'flex', padding: '0.75rem', gap: '0.5rem' }}>
                    <input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask about case..."
                        style={{ flex: 1, padding: '0.5rem' }}
                    />
                    <button onClick={sendMessage}>
                        <Send size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}