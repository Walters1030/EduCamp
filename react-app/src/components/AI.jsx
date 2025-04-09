import React, { useState, useRef, useEffect } from 'react';
import './form.css';
import config from "./config";
import Header from "./Header2"; // assuming you want the same header
import { CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function StudyChat() {
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setChat((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${config.API_BASE_URL}/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputValue: userMsg.text })
      });

      const data = await res.json();
      const aiMsg = { role: 'ai', text: data.message };
      setChat((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error:', error);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <>
      <Header />
      <div className="add-product-page" style={{ padding: '1rem', minHeight: '100vh' }}>
        <div className="add-product-container">
          <h1>Study Assistant Chat</h1>

          <div className="form-group" style={{
  maxHeight: '60vh',
  overflowY: 'auto',
  border: '1px solid #ccc',
  padding: '1rem',
  borderRadius: '10px',
  position: 'relative'
}}>
  {chat.length === 0 && !loading ? (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '200px', // or any height you prefer
      textAlign: 'center',
      color: '#777'
    }}>
      <img src="/LOGO.png" alt="Assistant Logo" style={{ width: '80px', marginBottom: '1rem' }} />
      <p style={{ fontSize: '18px' }}>How can I help you?</p>
    </div>
  ) : (
    <>
      {chat.map((msg, idx) => (
        <div
          key={idx}
          style={{
            textAlign: msg.role === 'user' ? 'right' : 'left',
            marginBottom: '10px'
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '10px 15px',
              borderRadius: '15px',
              backgroundColor: msg.role === 'user' ? '#1976d2' : '#f1f1f1',
              color: msg.role === 'user' ? 'white' : 'black',
              maxWidth: '70%',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
            dangerouslySetInnerHTML={{
              __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            }}
          />
        </div>
      ))}
      {loading && (
        <div style={{ textAlign: 'left', marginTop: '10px' }}>
          <CircularProgress size={20} />
        </div>
      )}
      <div ref={chatEndRef} />
    </>
  )}
</div>


          {/* custom styled input and send button */}
          <div className="form-group" style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Ask your study question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '16px',
                borderRadius: '20px',
                border: '1px solid #ccc',
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                backgroundColor: '#1976d2',
                border: 'none',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
