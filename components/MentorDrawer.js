'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Trash2, Sparkles, Loader2, Tag, BookOpen } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

/**
 * Volet latéral interactif pour converser avec l'Agent IA Mentor Cybersécurité.
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   initialContextTask?: { id: string, titre: string, description?: string, domainNom?: string } | null,
 *   initialContextNote?: { id: string, titre: string, contenu_markdown?: string } | null
 * }} props
 */
export default function MentorDrawer({
  isOpen,
  onClose,
  initialContextTask = null,
  initialContextNote = null,
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Bonjour ! Je suis ton Mentor Cybersécurité. Je peux t\'expliquer des notions (Linux, Réseaux, Web, Python...), te donner des indices sur tes tâches de la roadmap ou t\'aider à rédiger tes write-ups.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          contextTask: initialContextTask,
          contextNote: initialContextNote,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur de réponse du Mentor');
      }

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Désolé, une erreur s\'est produite lors de la communication. Veuillez vérifier que votre clé `GEMINI_API_KEY` est configurée et réessayer.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Conversation réinitialisée. Comment puis-je t\'aider sur tes objectifs de cybersécurité ?',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cyber-card border-l border-gray-800 shadow-cyber-card flex flex-col h-full">
          {/* En-tête du volet Mentor */}
          <div className="p-4 border-b border-gray-800 bg-cyber-surface flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyber-card rounded-xl text-cyber-accent shadow-cyber-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  Mentor Cybersécurité
                  <Sparkles className="w-3.5 h-3.5 text-cyber-accent" />
                </h2>
                <p className="text-[11px] text-gray-400">IA Pédagogique & Assistance Tech</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-cyber-card transition-all"
                title="Effacer la discussion"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-cyber-card transition-all"
                aria-label="Fermer le Mentor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Badge de contexte actif */}
          {(initialContextTask || initialContextNote) && (
            <div className="px-4 py-2 bg-cyber-card border-b border-gray-800 text-[11px] text-cyber-accent flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                Contexte :{' '}
                <strong className="text-white">
                  {initialContextTask?.titre || initialContextNote?.titre}
                </strong>
              </span>
            </div>
          )}

          {/* Zone des messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-cyber-surface text-cyber-accent flex items-center justify-center flex-shrink-0 shadow-cyber-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-cyber-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyber-accent text-cyber-bg font-semibold rounded-br-none'
                      : 'bg-cyber-surface text-gray-200 border border-gray-800/80 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-cyber-surface text-cyber-accent flex items-center justify-center flex-shrink-0 shadow-cyber-sm">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-cyber-surface px-4 py-2.5 rounded-2xl rounded-bl-none border border-gray-800 text-xs text-gray-400 flex items-center gap-2 shadow-cyber-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyber-accent" />
                  <span>Le Mentor analyse et rédige...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire de saisie */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-800 bg-cyber-surface flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question au Mentor..."
              className="flex-1 px-3.5 py-2.5 bg-cyber-card text-white text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-cyber-accent shadow-cyber-sm placeholder:text-gray-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-cyber-accent text-cyber-bg rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-40 shadow-cyber-sm flex items-center justify-center min-w-[40px]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
