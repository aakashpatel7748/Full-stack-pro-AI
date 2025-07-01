import React, { useState, useEffect } from 'react'
import { io } from "socket.io-client"
import "./chat.scss"

const Chat = () => {
  const [socket, setSocket] = useState(null)
  const [message, setMessage] = useState([])

  const [input, setInput] = useState([])

  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      withCredentials: true,
    })

    newSocket.on("message", (message) => {
      setMessage((prev) => [...prev, {
        role: "assistant",
        content: message.message
      }])
    })

    newSocket.on("chat-history", (messages) => {
      const formattedMessages = messages.map((message) => {
        return {
          role: message.role === 'model' ? 'assistant' : 'user',
          content: message.parts[0].text
        }
      })
      setMessage(formattedMessages)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }

  }, [])

  function sendMessage() {
    if (input.trim() === "") return

    const newMessage = {
      role: "user",
      content: input
    }

    setMessage((prev) => [...prev, newMessage])
    setInput("")

    socket.emit("message", { message: input })

  }


  return (
    <main className='chat-main'>
      <section className='chat-section'>
        <div className='conversation-area'>
          <div className='message'>
            {message.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className='message-content'>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className='input-area'>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Type your message here...'
              onKeyPress={(e) => {
                if (e.key == "Enter") {
                  sendMessage()
                }
              }}
              type="text"
            />
            <button onClick={() => { sendMessage() }}>Send</button>
          </div>
        </div>
      </section>

    </main>
  )
}

export default Chat