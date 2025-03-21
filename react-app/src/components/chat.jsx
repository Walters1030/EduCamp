import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import axios from "axios";
import './Header.css';
import Header from './Header2';
import MenuIcon from "@mui/icons-material/Menu";
import { 
  Drawer,Box, TextField, IconButton, Paper, Typography, Avatar, Tooltip, 
  List, ListItem, ListItemAvatar, ListItemText, Divider, Badge,
  AppBar, Toolbar, CssBaseline, styled, InputAdornment
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MoodIcon from "@mui/icons-material/Mood";
import EmojiPicker from "emoji-picker-react";
import SearchIcon from "@mui/icons-material/Search";
import { deepPurple } from "@mui/material/colors";
import config from "./config";
import { keyframes } from "@emotion/react";
const socket = io(`${config.API_BASE_URL}`);



const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

// ____________________________

const floatingAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const GradientBackground = styled(Box)`
  background: linear-gradient(
    45deg,
#35ef6d,
#91ff5a
  );
  animation: bganimated 15s infinite linear;
  background-size: 600% 600%;
  padding: 10px 20px;
  background-color: #002f3408;
  border-bottom: 3px solid #fff;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);

  @keyframes bganimated {
    0% {
      background-position: 0 85%;
    }
    50% {
      background-position: 100% 20%;
    }
    100% {
      background-position: 0 85%;
    }
  }
`;

const ModernAvatar = styled(Avatar)({
  border: '2px solid #fff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)'
  }
});

const ChatBubble = styled(Paper)(({ isuser }) => ({
  position: 'relative',
  maxWidth: '70%',
  borderRadius: isuser ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
  background: isuser ? 'linear-gradient(135deg, #667eea 0% 100%)' : '#fff',
  color: isuser ? '#fff' : 'inherit',
  padding: '12px 20px',
  margin: '8px 0',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',

}));
// __________________________________

const ChatLayout = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const incomingUserId = location.state?.userId;
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
};

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredChats = chats.filter(chat =>
    chat.contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!socket) return;
  
    socket.on("receiveMessage", (message) => {
      console.log("📩 Updating sidebar for both sender & receiver:", message);
  
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.contact._id === message.senderId || chat.contact._id === message.receiverId
            ? { ...chat, lastMessage: message }
            : chat
        )
      );
    });
  
    return () => {

      socket.off("receiveMessage");
    };
  }, []);
  

  useEffect(() => {
    const handleChatSelection = async () => {
      try {
        const chatsResponse = await axios.get(`${config.API_BASE_URL}/api/chats/${userId}`);
        setChats(chatsResponse.data);
  
        if (!incomingUserId) return;
  
        let existingChat = chatsResponse.data.find(chat => chat.contact._id === incomingUserId);
  
        if (existingChat) {
          setSelectedChat(existingChat);
        } else {
          // Fetch the actual user details
          const userResponse = await axios.get(`${config.API_BASE_URL}/api/users/${incomingUserId}`);
          const newChat = {
            chatId: incomingUserId,
            contact: { 
              _id: incomingUserId, 
              username: userResponse.data.username, // Use fetched username
              profileImage: userResponse.data.profileImage || "" 
            },
            lastMessage: null
          };
  
          setChats(prev => [...prev, newChat]);
          setSelectedChat(newChat);
        }
      } catch (error) {
        console.error("Chat handling error:", error);
      }
    };
  
    handleChatSelection();
  }, [userId, incomingUserId]);
  
  useEffect(() => {
    if (!socket) return;
  
    socket.on("receiveMessage", (message) => {
      console.log("📩 Updating sidebar with new message:", message); // Debugging log
  
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.contact._id === message.senderId || chat.contact._id === message.receiverId
            ? { ...chat, lastMessage: message }
            : chat
        )
      );
    });
  
    return () => {
      
      socket.off("receiveMessage");
    };
  }, []);
  

  // return (
    return (
      <>
    <Header toggleSidebar={toggleSidebar} />
      <Box sx={{ 
        display: 'flex', 
        height: '100vh',
        background: '#f8faff',
        overflow: "hidden",
      }}>
        
        <CssBaseline />
        
  {/* Sidebar Drawer */}
  <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 220,
              borderRight: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(8px)',
              overflowY: "auto",

            },
          }}
          ref={sidebarRef}
        >
        <GradientBackground sx={{height:'68px', p: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search chats"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.9)',
                marginTop: '-10px',
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'white' }} />
                </InputAdornment>
              ),
            }}
          />
        </GradientBackground>
        <List sx={{ overflowY: 'auto', height: 'calc(100vh - 80px)', p: 2,  }}>
          {filteredChats.map((chat) => (
            <React.Fragment key={chat._id}>
              <ListItem 
                button 
                onClick={() => setSelectedChat(chat)}
                selected={selectedChat?._id === chat._id}
                sx={{
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  mb: 1,
                  '&:hover': {
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
                    borderLeft: '4px solid #667eea'
                  }
                }}
              >
                <ListItemAvatar>
                  <StyledBadge badgeContent={chat.unread} color="primary">
                    <ModernAvatar sx={{ bgcolor: '#667eea' }}>
                      {chat.contact.username[0] || "U"}
                    </ModernAvatar>
                  </StyledBadge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight="600">
                      {chat.contact.username}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" noWrap sx={{ opacity: 0.8 }}>
 
                    </Typography>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" sx={{ opacity: 0.1 }} />
            </React.Fragment>
          ))}
        </List>
      </Drawer>


      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
      <ChatWindow selectedChat={selectedChat} userId={userId} setChats={setChats} />
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Select a chat to start messaging
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
    </>
  );
};

const ChatWindow = ({ selectedChat, userId, setChats, }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Generate unique room name for the chat
  const getRoomId = useCallback(() => {
    const ids = [userId, selectedChat.contact._id].sort();
    return `room_${ids.join('_')}`;
  }, [userId, selectedChat.contact._id]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${config.API_BASE_URL}/api/messages/${userId}/${selectedChat.contact._id}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Initialize socket connection
    socketRef.current = io(`${config.API_BASE_URL}`);
    const roomId = getRoomId();
    
    // Join the room
    socketRef.current.emit("join", roomId);

    // Listen for new messages
    socketRef.current.on("receiveMessage", (message) => {
      // setMessages(prev => [...prev, message]);
    });

    // Cleanup on unmount or chat change
    return () => {
      
      if (socketRef.current) {
        socketRef.current.emit("leave", roomId);
        socketRef.current.disconnect();
      }
    };
  }, [getRoomId, selectedChat.contact._id, userId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    const messageData = {
      senderId: userId,
      receiverId: selectedChat.contact._id,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
  
    try {
      // Send through socket
      socketRef.current.emit("sendMessage", {
        room: getRoomId(),
        message: messageData
      });
  
      // Send to API for persistence
     // Send to API for persistence and get the saved message
    const response = await axios.post(`${config.API_BASE_URL}/api/messages`, messageData);
    const savedMessage = response.data;
    
      // Clear input field after message is sent successfully
      setMessages(prev => {
        const newMessages = [...prev];
        const index = newMessages.findIndex(msg => 
          msg.text === savedMessage.text && 
          msg.senderId === savedMessage.senderId &&
          !msg._id // Check if it's the optimistic message without an _id
        );
        if (index !== -1) {
          newMessages[index] = savedMessage;
        }
        return newMessages;
      });

      setMessages((prev) => [...prev, savedMessage]);
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.contact._id === savedMessage.senderId || chat.contact._id === savedMessage.receiverId
            ? { ...chat, lastMessage: savedMessage }
            : chat
        )
      );
  
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const socketInstance = io(`${config.API_BASE_URL}`);
    socketRef.current = socketInstance;
  
    const roomId = getRoomId();
    console.log("🟢 Joining room:", roomId);
    socketInstance.emit("join", roomId);
  
    // Fetch past messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${config.API_BASE_URL}/api/messages/${userId}/${selectedChat.contact._id}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  
    // ✅ Correct the listener
    socketInstance.on("receiveMessage", (message) => {
      console.log("🔹 Message received in ChatWindow:", message);
      
      if (message.senderId === selectedChat.contact._id || message.receiverId === userId) {
        setMessages((prev) => [...prev, message]);
      }
    });
  
    return () => {
      console.log("🔴 Leaving room:", roomId);
      socketInstance.emit("leave", roomId);
      socketInstance.disconnect();
    };
  }, [getRoomId, selectedChat.contact._id, userId]);
  
  const sendMessage1 = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: userId,
      receiverId: selectedChat.contact._id,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    socket.emit("sendMessage", messageData);
 
    setNewMessage("");
  };

  const updateSidebarChatList = (message) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.contact._id === message.senderId || chat.contact._id === message.receiverId
          ? { ...chat, lastMessage: message }
          : chat
      )
    );
  };
  

  return (
    
    <>

      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar>
          <Avatar sx={{ bgcolor:' #667eea', mr: 2 }}>
            {selectedChat.contact.username[0]}
          </Avatar>
          <Typography variant="h6">{selectedChat.contact.username}</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f0f4f8' }}>
        {messages.length === 0 ? (
          <Box sx={{ 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <Typography variant="h6" color="textSecondary">
              No messages yet
              <br />
              <Typography variant="body1" component="span">
                Start your first conversation with {selectedChat.contact.username}
              </Typography>
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => (
            <Box key={index} sx={{ 
              display: 'flex', 
              justifyContent: msg.senderId === userId ? 'flex-end' : 'flex-start', 
              mb: 2 
            }}>
          <ChatBubble 
            isuser={msg.senderId === userId}
            elevation={0}
          >
                <Typography variant="body1">{msg.text}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5 }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Typography>
              </ChatBubble>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ 
        p: 2, 
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.03)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          position: 'relative',
          '& .MuiIconButton-root': {
            animation: `${floatingAnimation} 3s ease-in-out infinite`
          }
        }}>      
          {showEmojiPicker && (
            <Box sx={{ position: 'absolute', bottom: 60, right: 0, zIndex: 10 }}>
              <EmojiPicker
                onEmojiClick={(emoji) => setNewMessage(prev => prev + emoji.emoji)}
                previewConfig={{ showPreview: false }}
              />
            </Box>
          )}

          <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <MoodIcon color="action" />
          </IconButton>
            <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 24,
                bgcolor: 'background.paper',
              }
            }}
          />
          {/* ... rest of input area with new styling ... */}
          <IconButton
            color="primary"
            onClick={sendMessage}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0% 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(135, 155, 249, 0.3)',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 6px 16px rgba(102,126,234,0.4)'
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    
    </>
  );
};

export default ChatLayout;