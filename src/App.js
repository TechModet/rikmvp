import React, { useState } from "react";

function App() {
  const [chats, setChats] = useState([
    { id: 1, name: "New Chat", messages: [{ text: "Hi! How can I help you?", sender: "RIK" }] },
  ]);  
  const [activeChatId, setActiveChatId] = useState(1);
  const [input, setInput] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]); // File upload state

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const sendMessage = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    // Add user message and files to the active chat
    const updatedChats = chats.map((chat) => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [
            ...chat.messages,
            { text: input, sender: "user" },
            ...uploadedFiles.map((file) => ({ text: `File: ${file.name}`, sender: "user" })),
          ],
        };
      }
      return chat;
    });
    setChats(updatedChats);
    setInput("");
    setUploadedFiles([]);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_OPENAI_API_KEY`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: input }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from OpenAI");
      }

      const data = await response.json();
      const botReply = data.choices[0].message.content;

      const updatedChatsWithBotReply = chats.map((chat) => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: [...chat.messages, { text: input, sender: "user" }, { text: botReply, sender: "RIK" }],
          };
        }
        return chat;
      });      
      setChats(updatedChatsWithBotReply);
    } catch (error) {
      console.error("Error connecting to OpenAI:", error);
      alert("An error occurred while connecting to OpenAI.");
    }
  };

  const createNewChat = () => {
    const newChat = {
      id: chats.length + 1,
      name: `Chat ${chats.length + 1}`,
      messages: [{ text: "Hi! How can I help you?", sender: "RIK" }],
    };
    setChats([...chats, newChat]);
    setActiveChatId(newChat.id);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const startRenaming = (chatId, currentName) => {
    setIsRenaming(chatId);
    setRenameValue(currentName);
  };

  const renameChat = () => {
    const updatedChats = chats.map((chat) =>
      chat.id === isRenaming ? { ...chat, name: renameValue } : chat
    );
    setChats(updatedChats);
    setIsRenaming(false);
    setRenameValue("");
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#121212", color: "#ffffff" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", backgroundColor: "#1e1e1e", padding: "10px" }}>
        <h2 style={{ color: "#ffffff", textAlign: "center" }}>RIK</h2>
        <button
          onClick={createNewChat}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            backgroundColor: "#fa45b7",
            color: "#ffffff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          New Analysis
        </button>
        <ul style={{ listStyleType: "none", padding: "0" }}>
          {chats.map((chat) => (
            <li
              key={chat.id}
              style={{
                padding: "10px",
                margin: "5px 0",
                backgroundColor: chat.id === activeChatId ? "#333" : "transparent",
                color: "#ffffff",
                borderRadius: "5px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {isRenaming === chat.id ? (
                <>
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    style={{
                      backgroundColor: "#333",
                      color: "#ffffff",
                      border: "1px solid #555",
                      borderRadius: "5px",
                      padding: "5px",
                      flex: 1,
                    }}
                  />
                  <button
                    onClick={renameChat}
                    style={{
                      marginLeft: "5px",
                      backgroundColor: "#fa45b7",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "5px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <span onClick={() => setActiveChatId(chat.id)}>{chat.name}</span>
                  <button
                    onClick={() => startRenaming(chat.id, chat.name)}
                    style={{
                      marginLeft: "5px",
                      backgroundColor: "#555",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "5px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Rename
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h1 style={{ color: "#ffffff", textAlign: "center" }}>{activeChat?.name}</h1>
        <div style={{ backgroundColor: "#1e1e1e", border: "1px solid #333", borderRadius: "8px", padding: "10px", height: "300px", overflowY: "scroll" }}>
          {activeChat?.messages.map((msg, index) => (
            <p key={index} style={{ color: msg.sender === "RIK" ? "#fa45b7" : "#ffffff" }}>
  <strong>{msg.sender === "RIK" ? "RIK: " : "You: "}</strong>
  {msg.text}
</p>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Type a message..."
            style={{
              flex: 1,
              backgroundColor: "#333",
              color: "#ffffff",
              border: "1px solid #555",
              borderRadius: "8px",
              padding: "10px",
            }}
          />
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            style={{
              marginLeft: "10px",
              cursor: "pointer",
              padding: "10px",
              border: "1px solid #555",
              borderRadius: "8px",
              backgroundColor: "#333",
              color: "#ffffff",
            }}
          >
            📎
          </label>
          <button
            onClick={sendMessage}
            style={{
              backgroundColor: "#fa45b7",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              marginLeft: "10px",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;






