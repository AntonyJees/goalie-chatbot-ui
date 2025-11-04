import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Box, Paper, Typography, TextField, IconButton, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [userMsg, setUserMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!userMsg.trim()) return;

    const newMsg = { sender: "user", text: userMsg };
    setMessages((prev) => [...prev, newMsg]);
    setUserMsg("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:5005/webhooks/rest/webhook", {
        sender: "user",
        message: userMsg,
      });

      for (const r of res.data) {
        await new Promise((resolve) => setTimeout(resolve, 800)); 
        setMessages((prev) => [...prev, { sender: "bot", text: r.text }]);
      }
    } catch (error) {
      console.error("Error communicating with Rasa:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Rasa server not reachable." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 5,
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Goalie Chatbot ⚽
      </Typography>

      <Paper
        elevation={3}
        sx={{
          height: 400,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          bgcolor: "#f5f5f5",
        }}
      >
        {messages.map((msg, i) => (
          <Box
            key={i}
            sx={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              bgcolor: msg.sender === "user" ? "#1976d2" : "#e0e0e0",
              color: msg.sender === "user" ? "#fff" : "#000",
              borderRadius: 2,
              p: 1.5,
            }}
          >
            {msg.text.split("\n").map((line, idx) => (
              <Typography key={idx} variant="body2">
                {line}
              </Typography>
            ))}
          </Box>
        ))}

        {isTyping && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Goalie is typing...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      <Box sx={{ display: "flex", mt: 2, gap: 1 }}>
        <TextField
          variant="outlined"
          placeholder="Type a message..."
          value={userMsg}
          onChange={(e) => setUserMsg(e.target.value)}
          onKeyDown={handleKeyPress}
          fullWidth
        />
        <IconButton color="primary" onClick={sendMessage}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Chat;
