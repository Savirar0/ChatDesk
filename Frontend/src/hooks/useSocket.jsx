import { useEffect, useState, useRef } from "react";
import { API_BASE_URL } from "../../config";

export const useSocket = (userId) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const wsUrl = `${API_BASE_URL.replace(/^http/, "ws")}/ws`;

    // Connect to FastAPI WebSocket
    // NOTE: Based on your backend, the FastAPI endpoint is /ws,
    // and you are appending the userId to the path, which suggests the backend endpoint
    // should be defined as "/ws/{userId}". This structure might be faulty
    // if your backend only uses "/ws". Let's assume your backend is looking for a path parameter.
    const ws = new WebSocket(`${wsUrl}/${userId}`);
    socketRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "typing") {
          setTyping(true);
        } else if (msg.type === "stop_typing") {
          setTyping(false);
        } else if (msg.type === "agent_connected") {
          setAgentConnected(true);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              text: `Agent ${msg.agentName} has joined.`,
              sender: "system",
              timestamp: new Date().toISOString(),
            },
          ]);
        } else {
          // Normal chat message
          setMessages((prev) => [...prev, msg]);
        }
      } catch (err) {
        console.error("❌ Failed to parse WS message:", err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("❌ WebSocket disconnected");
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    return () => {
      // Safely close on component unmount
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [userId]);

  const sendMessage = (text, domain) => {
    if (socketRef.current && connected) {
      const msg = {
        id: Date.now(),
        text,
        sender: "user",
        domain,
        timestamp: new Date().toISOString(),
      };
      socketRef.current.send(JSON.stringify(msg));
      setMessages((prev) => [...prev, msg]);
    }
  };

  const startTyping = () => {
    if (socketRef.current && connected) {
      socketRef.current.send(JSON.stringify({ type: "typing", userId }));
    }
  };

  const stopTyping = () => {
    if (socketRef.current && connected) {
      socketRef.current.send(JSON.stringify({ type: "stop_typing", userId }));
    }
  };

  return {
    connected,
    messages,
    typing,
    agentConnected,
    sendMessage,
    startTyping,
    stopTyping,
    setMessages,
  };
};
