import { createRoot } from "react-dom/client";
import { usePartySocket } from "partysocket/react";
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router";

import { names, type RtcMessage, type Message } from "../shared";

function PasswordModal({ onSubmit, onCancel }: { onSubmit: (password: string) => void; onCancel: () => void; }) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Enter Password</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box" }}
          />
          <div style={{ marginTop: "10px" }}>
            <button type="submit">Submit</button>
            <button type="button" onClick={onCancel} style={{ marginLeft: "10px" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AuthKeyModal({ authKey, onClose }: { authKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(authKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Authentication Key</h3>
        <p>Here is your unique key:</p>
        <pre>{authKey}</pre>
        <button onClick={handleCopy}>{copied ? "Copied!" : "Copy to Clipboard"}</button>
        <button onClick={onClose} style={{ marginLeft: "10px" }}>Close</button>
      </div>
    </div>
  );
}

function App() {
  const [name] = useState(names[Math.floor(Math.random() * names.length)]);
  const [messages, setMessages] = useState<RtcMessage[]>([]);
  const { room } = useParams();
  const [authKey, setAuthKey] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAuthKeyModal, setShowAuthKeyModal] = useState(false);

  const handleAuthKeyClick = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (password: string) => {
    setShowPasswordModal(false);
    if (password) {
      try {
        const response = await fetch("/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        if (response.ok) {
          const data = await response.json();
          setAuthKey(data.key);
          setShowAuthKeyModal(true);
        } else {
          alert("Authentication failed.");
        }
      } catch (error) {
        console.error("Authentication request failed:", error);
        alert("An error occurred during authentication.");
      }
    }
  };


  if (room == null || room == undefined) {
    return (
      <div>The room name is required at the end of the url.</div>
    );
  }

  const socket = usePartySocket({
    party: "chat",
    room,
    onMessage: (evt) => {
      const message = JSON.parse(evt.data as string) as Message;
      if (message.type !== "all") {
        const foundIndex = messages.findIndex((m) => m.mid === message.mid);
        if (foundIndex === -1) {
          // probably someone else who added a message
          setMessages((messages) => [
            ...messages,
            {
              uid: message.uid,
              mid: message.mid,
              type: message.type,
              data: null,
            },
          ]);
        } else {
          // this usually means we ourselves added a message
          // and it was broadcasted back
          // so let's replace the message with the new message
          setMessages((messages) => {
            return messages
              .slice(0, foundIndex)
              .concat({
                mid: message.mid,
                uid: message.uid,
                type: message.type,
                data: null,
              })
              .concat(messages.slice(foundIndex + 1));
          });
        }
      } else {
        setMessages(message.messages);
      }
    },
  });

  return (
    <div className="container">
      <div className="chat container">
        {messages.map((message) => (
          <div key={message.mid} className="row message">
            <div className="two columns user">{message.uid}</div>
            <div className="ten columns">{message.data}</div>
          </div>
        ))}
        {showPasswordModal && (
          <PasswordModal
            onSubmit={handlePasswordSubmit}
            onCancel={() => setShowPasswordModal(false)}
          />
        )}
        {showAuthKeyModal && authKey && (
          <AuthKeyModal authKey={authKey} onClose={() => setShowAuthKeyModal(false)} />
        )}
      </div>
      <div className="row">
        <button onClick={handleAuthKeyClick} style={{ marginBottom: "20px" }}>Auth Key</button>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/:room" element={<App />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>,
);
