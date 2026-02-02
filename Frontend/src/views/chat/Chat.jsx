import React, { useState, useEffect } from 'react'
import { io } from "socket.io-client"
import { Paperclip, Send, Loader2 } from "lucide-react"
import "./chat.scss"

const Chat = () => {
  const [socket, setSocket] = useState(null)
  const [message, setMessage] = useState([])
  const [input, setInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)

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

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("resume", file)

    // Add a temporary message to show the file is being processed
    const tempMsg = { role: "assistant", content: `Analyzing your resume: ${file.name}...` }
    setMessage(prev => [...prev, { role: "user", content: `Uploaded resume: ${file.name}` }, tempMsg])

    try {
      const response = await fetch("http://localhost:3000/api/resume/analyze-resume", {
        method: "POST",
        body: formData
      })
      const data = await response.json()

      if (response.ok) {
        // Update the last message with the actual analysis
        setMessage(prev => {
          const newMsgs = [...prev]
          newMsgs[newMsgs.length - 1] = { role: "assistant", content: data.analysis }
          return newMsgs
        })
      } else {
        throw new Error(data.message || "Failed to analyze resume")
      }
    } catch (error) {
      setMessage(prev => {
        const newMsgs = [...prev]
        newMsgs[newMsgs.length - 1] = { role: "assistant", content: "Error: " + error.message }
        return newMsgs
      })
    } finally {
      setIsUploading(false)
    }
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
            <label className="upload-btn">
              <Paperclip size={20} />
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={isUploading}
              />
            </label>
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
              disabled={isUploading}
            />
            <button
              disabled={isUploading}
              onClick={() => { sendMessage() }}
              className="send-btn"
            >
              {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </section>

    </main>
  )
}

export default Chat