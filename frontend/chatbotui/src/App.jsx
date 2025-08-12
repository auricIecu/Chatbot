import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import './fonts.css';
import customLogo from './assets/Logo1.png';
import iconoUsuario from './assets/Singo usuario.png';
import iconoPeerToPeer from './assets/Mensajes peer to peer.png';
import iconoHistorialConv from './assets/Signo historial conv.png';
import iconoEnviar from './assets/Signo enviar.png';
import iconoBuscar from './assets/Signo buscar.png';
import iconoInventario from './assets/Signo inventario.png';
import iconoImportaciones from './assets/Signo importaciones.png';
import iconoAdjuntar from './assets/Signo adjuntar.png';
import ConversationHistory from './ConversationHistory';
import HistoryPanel from './HistoryPanel';

const App = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState('');
  const [typingMessageId, setTypingMessageId] = useState(null);

  const chatContainerRef = useRef(null);

  // Typewriter effect function
  const typewriterEffect = (fullText, messageId) => {
    setIsTyping(true);
    setTypingMessageId(messageId);
    
    const words = fullText.split(' ');
    let currentIndex = 1;
    let currentAiMessageStartPosition = null;
    
    // Start with the first word immediately (don't clear text first)
    if (words.length > 0) {
      setCurrentTypingText(words[0]);
      
      // Capture the scroll position right after the first word is set
      setTimeout(() => {
        if (chatContainerRef.current) {
          currentAiMessageStartPosition = chatContainerRef.current.scrollTop;
        }
      }, 50);
    }
    
    const typeInterval = setInterval(() => {
      if (currentIndex < words.length) {
        setCurrentTypingText(prev => prev + ' ' + words[currentIndex]);
        
        // Auto-scroll to follow the typing
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
        
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setCurrentTypingText('');
        setTypingMessageId(null);
        
        // Add the complete message to chat history
        setChatHistory(prevHistory => {
          const updatedHistory = [...prevHistory];
          const lastIndex = updatedHistory.length - 1;
          if (updatedHistory[lastIndex] && updatedHistory[lastIndex].sender === 'ai') {
            updatedHistory[lastIndex] = {
              ...updatedHistory[lastIndex],
              text: fullText,
              id: messageId
            };
          }
          return updatedHistory;
        });
        
        // Reset scroll to the start of the CURRENT AI message after a short delay
        setTimeout(() => {
          if (chatContainerRef.current) {
            // Find the current AI message element and scroll to it
            const aiMessages = chatContainerRef.current.querySelectorAll('[data-message-id="' + messageId + '"]');
            if (aiMessages.length > 0) {
              aiMessages[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (currentAiMessageStartPosition !== null) {
              chatContainerRef.current.scrollTop = currentAiMessageStartPosition;
            }
          }
        }, 500); // 500ms delay before resetting scroll
      }
    }, 100); // Adjust speed here (100ms between words)
  };

  useEffect(() => {
    if (chatContainerRef.current && chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      // Only auto-scroll for user messages, not AI responses
      if (lastMessage.sender === 'user') {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!conversationId) {
      setConversationId(Date.now().toString());
    }
  }, [conversationId]);
  
  // Función para cargar los mensajes de una conversación seleccionada del historial
  const loadConversation = async (selectedConversationId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/conversations/${selectedConversationId}/messages`);
      
      if (!response.ok) {
        throw new Error('Error loading conversation');
      }
      
      const messages = await response.json();
      
      // Transformar los mensajes al formato utilizado en el chatHistory
      const formattedMessages = messages.map(msg => ({
        sender: msg.role,
        text: msg.content,
        id: msg.id
      }));
      
      setChatHistory(formattedMessages);
      setConversationId(selectedConversationId);
      
      // Asegurarse de que se muestre la vista de chat activo, no la de bienvenida
      if (isFirstInteraction) {
        setIsFirstInteraction(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to send a message (either from input or predefined prompt)
  const sendMessageToAPI = async (messageText) => {
    if (messageText.trim() === '') return;

    setLoading(true);
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { sender: 'user', text: messageText },
    ]);

    // Check if message contains "Fermagri" and provide static response
    if (messageText.toLowerCase().includes('fermagri')) {
      const messageId = Date.now();
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'ai', text: '', id: messageId },
      ]);
      setMessage('');
      setLoading(false);
      
      // Static response about Fermagri
      const fermagriResponse = `🏢 Fermagri es una empresa ecuatoriana que, desde 1998, importa y comercializa fertilizantes con un portafolio que abarca productos edáficos y solubles.\n\nEn su sitio presentan cinco líneas: Edáficos, Solubles, Master Protec, Especializados y Acuícolas. Además de la oferta de productos, declaran servicios de asesoría técnica —con un equipo de ingenieros que acompaña con planes de nutrición— y logística. \n\nEntre los productos listados se encuentran KALISOP (sulfato de potasio granular), PATENTKALI (potasio con magnesio y azufre en sulfatos solubles), KS MAG+B (aporte de K, Mg y S), DAP (fuente de fósforo y nitrógeno), nitrato de magnesio, ulexita granular (borato), mezclas específicas como Fermapastos Gold (pastos y forraje), Fermacaña Gold (caña de azúcar, variante Sierra), Fermarroz Gold (arroz), Platanero Gold (para palma aceitera en producción), y productos para acuicultura como el muriato acuícola KCl 60% K₂O y el nitrato de amonio acuícola. \n\nPara contacto, el sitio muestra el correo info@fermagri.ec y una dirección en Quito: Av. Troncal E-35 Lote 01 y Av. Los Guabos, además de una sección de "Contactos".`;
      
      typewriterEffect(fermagriResponse, messageId);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          role: 'user',
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Error with API request');
      }

      const data = await response.json();
      // Add placeholder AI message that will be updated by typewriter effect
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'ai', text: '', id: data.message_id },
      ]);
      setMessage('');
      // Start typewriter effect
      typewriterEffect(data.response, data.message_id);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Original sendMessage function for form submission
  const sendMessage = async (event) => {
    event.preventDefault();
    await sendMessageToAPI(message);
  };

  // Function to handle predefined prompts with static responses
  const sendPredefinedPrompt = async (promptText, staticResponse) => {
    if (loading) return; // Prevent multiple simultaneous requests
    
    // Only add static AI response (no user message shown in chat)
    const messageId = Date.now();
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { sender: 'ai', text: '', id: messageId },
    ]);
    
    // Start typewriter effect with static response
    typewriterEffect(staticResponse, messageId);
  };

  return (
    <div className="bg-[#1a1a1a] h-screen flex flex-col mobile-safe-area" style={{ height: '100vh' }}>
      {/* Top Bar - Fixed */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] flex-shrink-0">
        <button className="p-2">
          <img src={iconoUsuario} alt="Usuario" className="w-11 h-11" />
        </button>
        <h1 className="text-3xl font-semibold orito-title" style={{ color: '#f7c61a' }}>Orito</h1>
        <button className="p-2">
          <img src={iconoPeerToPeer} alt="Peer to Peer" className="w-11 h-11" />
        </button>
      </div>

      {/* Middle Section - Scrollable Chat Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background with blurred logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <img 
              src={customLogo} 
              alt="Orito Logo" 
              className="w-36 h-36 opacity-20 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-800/20 rounded-full"></div>
          </div>
        </div>

        {/* Chat Messages - Scrollable */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >

          
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              data-message-id={msg.id}
            >
              <div className={`${
                msg.sender === 'user' 
                  ? 'max-w-[80%] p-3 rounded-2xl backdrop-blur-sm bg-gray-900/30 text-white rounded-br-sm border border-gray-700/20' 
                  : 'w-full p-3 text-white text-justify'
              }`}>
                <p className="text-sm">
                  {msg.sender === 'ai' && isTyping && typingMessageId === msg.id
                    ? (
                      <>
                        {currentTypingText}
                        <span className="typewriter-cursor">|</span>
                      </>
                    )
                    : msg.text
                  }
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-white p-3 rounded-2xl rounded-bl-sm animate-pulse">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Bubble - Fixed */}
      <div className="px-4 pb-4 bg-[#1a1a1a] flex-shrink-0">
        <form onSubmit={sendMessage} className="relative">
          <div className="bg-[#2a2a2a] rounded-full flex items-center px-4 py-3 border border-gray-700 shadow-lg">
            <button 
              type="button"
              className="mobile-button p-2 hover:bg-gray-700 rounded-full transition-colors touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <img src={iconoAdjuntar} alt="Adjuntar" className="w-9 h-9" />
            </button>
            
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (message.trim() && !loading) {
                    sendMessage(e);
                  }
                }
              }}
              placeholder="Pregúntame algo"
              className="flex-1 bg-transparent text-white placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-0 focus:border-transparent text-4xl text-center"
              style={{ 
                fontSize: '16px', // Prevents zoom on iOS
                WebkitAppearance: 'none',
                borderRadius: 0
              }}
              disabled={loading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            
            <button 
              type="submit"
              disabled={loading || !message.trim()}
              className={`mobile-button p-2 rounded-full transition-all touch-manipulation ${
                message.trim() && !loading
                  ? 'hover:bg-blue-600 text-blue-500 hover:text-white'
                  : 'opacity-50 text-gray-500'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <img 
                src={iconoEnviar} 
                alt="Enviar" 
                className={`w-9 h-9 transition-opacity ${
                  message.trim() && !loading ? 'opacity-100' : 'opacity-50'
                }`} 
              />
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Navigation Bar - Fixed */}
      <div className="bg-[#1a1a1a] px-4 py-2 flex-shrink-0">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => sendPredefinedPrompt(
               'Ayúdame a buscar información sobre productos específicos.',
               '🔍 Puedo ayudarte a encontrar información sobre cualquier producto específico de Fermagri. Dime: \n\n- Nombre del producto que buscas'
            )}
            className={`mobile-button p-3 rounded-full transition-colors touch-manipulation hover:bg-gray-800 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            disabled={loading}
          >
            <img src={iconoBuscar} alt="Buscar" className="w-11 h-11" />
          </button>
          
          <button 
            onClick={() => sendPredefinedPrompt(
              'Necesito ayuda con informacion de inventario. ¿Puedes ayudarme consultar información sobre el stock de productos?',
              '📦 Puedo ayudarte con informacion de inventario de Fermagri. Dime:\n\n- Nombre del producto del que quieres saber su stock'
            )}
            className={`mobile-button p-3 rounded-full transition-colors touch-manipulation hover:bg-gray-800 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Inventario"
            disabled={loading}
          >
            <img src={iconoInventario} alt="Inventario" className="w-11 h-11" />
          </button>
          
          <button 
            onClick={() => sendPredefinedPrompt(
              'Quiero información sobre importaciones. ¿Puedes ayudarme con la fecha de llegada de importaciones de productos especificos?',
              '🚢  Puedo proporcionarte información sobre importaciones de Fermagri. Dime:\n\n- Nombre del producto del que quieres saber su futura importacion'
            )}
            className={`mobile-button p-3 rounded-full transition-colors touch-manipulation hover:bg-gray-800 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Importaciones"
            disabled={loading}
          >
            <img src={iconoImportaciones} alt="Importaciones" className="w-11 h-11" />
          </button>
          
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`mobile-button p-3 rounded-full transition-colors touch-manipulation ${
              showHistory ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Historial"
          >
            <img src={iconoHistorialConv} alt="Historial" className="w-11 h-11" />
          </button>
        </div>
      </div>

      {/* History Panel Overlay */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="w-80 bg-[#1a1a1a] h-full border-l border-gray-800 overflow-y-auto">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Historial</h3>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            <HistoryPanel
              onSelectConversation={loadConversation}
              currentConversationId={conversationId}
              showHistory={showHistory}
              setShowHistory={setShowHistory}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;