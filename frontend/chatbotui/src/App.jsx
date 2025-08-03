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
  const [conversationId, setConversationId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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

  const sendMessage = async (event) => {
    event.preventDefault();

    if (message.trim() === '') return;

    setLoading(true);
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { sender: 'user', text: message },
    ]);

    try {
      const response = await fetch(`http://localhost:8000/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          role: 'user',
          conversation_id: conversationId, // Send the conversation_id with the message
        }),
      });

      if (!response.ok) {
        throw new Error('Error with API request');
      }

      const data = await response.json();
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'ai', text: data.response, id: data.message_id },
      ]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a]">
        <button className="p-2">
          <img src={iconoUsuario} alt="Usuario" className="w-11 h-11" />
        </button>
        <h1 className="text-3xl font-semibold orito-title" style={{ color: '#f7c61a' }}>Orito</h1>
        <button className="p-2">
          <img src={iconoPeerToPeer} alt="Peer to Peer" className="w-11 h-11" />
        </button>
      </div>

      {/* Middle Section - Main Content */}
      <div className="flex-1 flex flex-col relative">
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

        {/* Chat Messages */}
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
            >
              <div className={`${
                msg.sender === 'user' 
                  ? 'max-w-[80%] p-3 rounded-2xl backdrop-blur-sm bg-gray-900/30 text-white rounded-br-sm border border-gray-700/20' 
                  : 'w-full p-3 text-white text-justify'
              }`}>
                <p className="text-sm">{msg.text}</p>
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

        {/* Input Bubble */}
        <div className="px-4 pb-4 safe-bottom">
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
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-[#1a1a1a] px-4 py-2 safe-bottom">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => setActiveTab('search')}
            className={`mobile-button p-3 rounded-full transition-colors touch-manipulation ${
              activeTab === 'search' ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Buscar"
          >
            <img src={iconoBuscar} alt="Buscar" className="w-11 h-11" />
          </button>
          
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`mobile-button p-3 rounded-full transition-colors touch-manipulation ${
              activeTab === 'inventory' ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Inventario"
          >
            <img src={iconoInventario} alt="Inventario" className="w-11 h-11" />
          </button>
          
          <button 
            onClick={() => setActiveTab('imports')}
            className={`mobile-button p-3 rounded-full transition-colors touch-manipulation ${
              activeTab === 'imports' ? 'bg-gray-700' : 'hover:bg-gray-800'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Importaciones"
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