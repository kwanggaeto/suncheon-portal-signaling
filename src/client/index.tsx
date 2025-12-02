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

function App() {
  const [name] = useState(names[Math.floor(Math.random() * names.length)]);
  const [messages, setMessages] = useState<RtcMessage[]>([]);
  const { room } = useParams();


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
    <div className="chat container">
      {messages.map((message) => (
        <div key={message.mid} className="row message">
          <div className="two columns user">{message.uid}</div>
          <div className="ten columns">{message.data}</div>
        </div>
      ))}      
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
