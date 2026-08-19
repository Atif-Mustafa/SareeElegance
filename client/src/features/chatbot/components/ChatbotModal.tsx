import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { mockProducts } from '@/features/catalog/data/mockData';
import { Product } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Bot,
  User,
  Send,
  X,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Video,
  Globe,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { t } from '@/lib/i18n';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  products?: Product[];
  quickActions?: { label: string; type: 'video' | 'returns' | 'category' | 'order'; payload?: string }[];
}

export const ChatbotModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    language,
    addToCart,
    userOrders,
    setIsVideoModalOpen,
    openGlossaryModal,
    addToast
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting = t('chat.welcome', language);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: '👑 Bridal Sarees Under ₹30k', type: 'category', payload: 'banarasi' },
        { label: '🔍 How to test pure silk?', type: 'category', payload: 'glossary' },
        { label: '📦 Track Order SE-894102', type: 'order', payload: 'SE-894102' },
        { label: '📹 Book Video Shopping', type: 'video' }
      ]
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  // Update initial message if language changes and only initial message is present
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'bot') {
      setMessages([
        {
          ...messages[0],
          text: t('chat.welcome', language)
        }
      ]);
    }
  }, [language]);

  const generateBotReply = (query: string): ChatMessage => {
    const q = query.toLowerCase();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Order Tracking Check
    if (q.includes('order') || q.includes('track') || q.includes('se-') || q.includes('delivery')) {
      const matchOrder = userOrders.find(o => q.includes(o.orderId.toLowerCase())) || userOrders[0];
      if (matchOrder) {
        return {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `📦 **Order Status for ${matchOrder.orderId}:**\n• Status: ${matchOrder.orderStatus.replace('_', ' ')}\n• Carrier: ${matchOrder.carrierName}\n• Tracking #: ${matchOrder.trackingNumber}\n• Est. Delivery: ${matchOrder.estimatedDelivery}`,
          timestamp: time,
          quickActions: [
            { label: 'View Order Details', type: 'order', payload: matchOrder.orderId },
            { label: '15-Day Return Policy', type: 'returns' }
          ]
        };
      }
    }

    // 2. Bridal / Banarasi / Kanjivaram Product Recommendations
    if (q.includes('bridal') || q.includes('banarasi') || q.includes('red') || q.includes('wedding')) {
      const bridalSarees = mockProducts.filter(p => p.category === 'banarasi' || p.occasion === 'Bridal').slice(0, 2);
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '👑 Excellent choice! Here are our finest handcrafted Banarasi & Kanjivaram Bridal Sarees, woven with pure Gold/Silver Zari and Silk Mark certification:',
        timestamp: time,
        products: bridalSarees,
        quickActions: [
          { label: 'Book Live Video Call', type: 'video' },
          { label: 'Custom Blouse Fitting Guide', type: 'category', payload: 'blouse' }
        ]
      };
    }

    if (q.includes('kanjivaram') || q.includes('south') || q.includes('temple') || q.includes('silk')) {
      const kanjivaramSarees = mockProducts.filter(p => p.category === 'kanjivaram').slice(0, 2);
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '🌺 Kanjivaram Korvai silks are renowned for their interlocking contrast pallus and 3-ply mulberry thread structure. Here are top selections:',
        timestamp: time,
        products: kanjivaramSarees
      };
    }

    // 3. Silk Mark & Burn Test
    if (q.includes('silk mark') || q.includes('pure') || q.includes('burn test') || q.includes('authentic') || q.includes('fake')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '✨ **100% Pure Silk Guarantee:**\n1. All SareeElegance pieces carry an official Silk Mark Organization of India hologram tag.\n2. **Burn Test:** Pure silk threads burn with a natural hair aroma and form fine ash. Synthetic yarns melt into hard plastic.\n3. Every piece comes in an unbleached cotton muslin storage box.',
        timestamp: time,
        quickActions: [
          { label: 'Open Silk Glossary', type: 'category', payload: 'glossary' }
        ]
      };
    }

    // 4. Blouse Measurement Assistance
    if (q.includes('blouse') || q.includes('stitch') || q.includes('measurement') || q.includes('size')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '✂️ **Bespoke Blouse Tailoring:**\n• We tailor custom blouses to your exact bust, waist, front/back neck depth, and sleeve specifications.\n• Every blouse includes **+2 inches of internal seam margin** for easy local alterations.',
        timestamp: time,
        quickActions: [
          { label: 'Custom Blouse Studio', type: 'category', payload: 'blouse' }
        ]
      };
    }

    // 5. Returns & Cancellations
    if (q.includes('return') || q.includes('exchange') || q.includes('cancel') || q.includes('refund')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '🔄 **15-Day Hassle-Free Exchange Policy:**\n• Enjoy complimentary reverse courier pickup from your doorstep.\n• Unstitched sarees with Silk Mark tags attached are eligible for 100% full refund.',
        timestamp: time,
        quickActions: [
          { label: 'View Return Policy', type: 'returns' }
        ]
      };
    }

    // Default Fallback
    const recs = mockProducts.slice(0, 2);
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `I am happy to assist! I can help you discover pure silk sarees, explain handloom weaving techniques (Kadwa, Korvai), guide you on custom blouse measurements, or track existing orders.`,
      timestamp: time,
      products: recs,
      quickActions: [
        { label: 'Explore Collections', type: 'category', payload: 'all' },
        { label: 'Book Video Call', type: 'video' }
      ]
    };
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsgText = input.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: time
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botReply = generateBotReply(userMsgText);
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 700);
  };

  const handleActionClick = (action: { label: string; type: string; payload?: string }) => {
    if (action.type === 'video') {
      setIsVideoModalOpen(true);
    } else if (action.type === 'returns') {
      navigate('/cancellation-and-returns');
    } else if (action.type === 'order') {
      navigate('/account?tab=orders');
    } else if (action.type === 'category') {
      if (action.payload === 'glossary') {
        openGlossaryModal();
      } else if (action.payload === 'blouse') {
        navigate('/account?tab=blouse');
      } else {
        navigate(`/collections/${action.payload || 'all'}`);
      }
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            id="open-chatbot-btn"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] p-3.5 sm:px-5 sm:py-3.5 rounded-full border-2 border-[#C28E46] shadow-2xl transition-all duration-300 transform hover:scale-105"
            aria-label="Open AI Royal Silk Concierge Chat"
          >
            <div className="relative">
              <Bot className="w-6 h-6 text-[#D4AF37] group-hover:text-[#2C221E] transition-colors" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#2C221E] animate-pulse" />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-bold text-[#D4AF37] group-hover:text-[#2C221E] uppercase tracking-wider block leading-none">
                Royal Concierge AI
              </span>
              <span className="text-xs font-serif font-bold text-white group-hover:text-[#2C221E] block">
                Ask Silk Stylist
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Chat Window Modal / Floating Widget */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 z-50 transition-all duration-300 ease-in-out ${
            isMinimized
              ? 'bottom-6 w-72 sm:w-80 h-16 bg-[#2C221E] text-white rounded-2xl border-2 border-[#C28E46] shadow-2xl p-4 flex items-center justify-between'
              : 'bottom-4 sm:bottom-6 w-[92vw] sm:w-[420px] h-[540px] max-h-[85vh] bg-white rounded-3xl border-2 border-[#C28E46] shadow-2xl flex flex-col overflow-hidden animate-fadeIn'
          }`}
        >
          {/* Header */}
          <div className="bg-[#2C221E] text-white p-4 border-b border-[#C28E46]/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-[#C28E46]/20 border border-[#C28E46] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#2C221E]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#D4AF37]">
                  {t('chat.title', language)}
                </h3>
                <p className="text-[10px] text-stone-300 flex items-center gap-1">
                  <span>{t('chat.subtitle', language)}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">Online</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
                title="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF7F2]/50 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 px-1">
                      {msg.sender === 'bot' ? (
                        <span className="font-bold text-[#C28E46] flex items-center gap-1">
                          <Bot className="w-3 h-3" /> Silk Concierge
                        </span>
                      ) : (
                        <span className="font-bold text-stone-600 flex items-center gap-1">
                          <User className="w-3 h-3" /> You
                        </span>
                      )}
                      <span>• {msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-[#2C221E] text-white rounded-tr-none'
                          : 'bg-white text-stone-800 border border-[#E6DFC6] rounded-tl-none whitespace-pre-line'
                      }`}
                    >
                      {msg.text}

                      {/* Attached Product Cards if any */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-3 space-y-2 pt-2 border-t border-[#F3EFE6]">
                          {msg.products.map((p) => (
                            <div
                              key={p.id}
                              className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E6DFC6] flex items-center justify-between gap-3 text-left"
                            >
                              <img
                                src={p.images[0]}
                                alt={p.title}
                                className="w-12 h-14 object-cover rounded-lg shrink-0 border border-stone-200"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-serif font-bold text-xs text-[#2C221E] truncate">
                                  {p.title}
                                </h5>
                                <p className="text-[10px] text-stone-500 font-mono">
                                  ₹{p.priceINR.toLocaleString('en-IN')}
                                </p>
                                <span className="text-[9px] text-[#C28E46] font-bold block">
                                  {p.fabric}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  addToCart(p, p.colors[0], { fallAndPico: true, blouseOption: 'unstitched', petticoatOption: false });
                                  addToast(`Added "${p.title}" to bag`, 'success');
                                }}
                                className="bg-[#2C221E] hover:bg-[#C28E46] text-[#D4AF37] hover:text-[#2C221E] p-2 rounded-lg transition-colors shrink-0"
                                title="Add to Bag"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Pill Actions */}
                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                        {msg.quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(action)}
                            className="bg-white hover:bg-[#2C221E] text-stone-700 hover:text-[#D4AF37] border border-[#E6DFC6] hover:border-[#C28E46] px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shadow-2xs text-left"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-stone-500 text-xs italic bg-white p-3 rounded-2xl border border-[#E6DFC6] w-36">
                    <Sparkles className="w-3.5 h-3.5 text-[#C28E46] animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E6DFC6] flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chat.placeholder', language)}
                  className="flex-1 bg-[#FAF7F2] text-stone-800 text-xs px-3.5 py-2.5 rounded-xl border border-[#E6DFC6] focus:outline-none focus:border-[#C28E46]"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-[#2C221E] hover:bg-[#C28E46] disabled:opacity-40 text-[#D4AF37] hover:text-[#2C221E] p-2.5 rounded-xl transition-all shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
