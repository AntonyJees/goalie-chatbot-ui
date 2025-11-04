import React, { useState } from "react";
import axios from "axios";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [userMsg, setUserMsg] = useState("");

  const sendMessage = async () => {
    if (!userMsg.trim()) return;

    const newMsg = { sender: "user", text: userMsg };
    setMessages([...messages, newMsg]);
    setUserMsg("");

    try {
      const res = await axios.post("http://localhost:5005/webhooks/rest/webhook", {
        sender: "user",
        message: userMsg,
      });

      const botReplies = res.data.map((r) => ({
        sender: "bot",
        text: r.text,
      }));

      setMessages((prev) => [...prev, ...botReplies]);
    } catch (error) {
      console.error("Error communicating with Rasa:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Rasa server not reachable." },
      ]);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>Goalie Chatbot ⚽</h2>

      <div
        style={{
          height: 350,
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "10px",
          background: "#fafafa",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "10px 0",
            }}
          >
            <b>{msg.sender === "user" ? "You" : "Goalie"}:</b> {msg.text}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: "5px" }}>
        <input
          value={userMsg}
          onChange={(e) => setUserMsg(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button onClick={sendMessage} style={{ padding: "8px 15px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
