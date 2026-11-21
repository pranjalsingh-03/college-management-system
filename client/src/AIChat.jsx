import React, { useRef, useState, useEffect } from "react";
import { Bot, Send, Sparkles, UserRound, Trash2, Copy, GraduationCap, BookOpen, CalendarDays, Lightbulb } from "lucide-react";

const suggestions = [
  { icon: BookOpen, text: "Explain a computer science topic" },
  { icon: GraduationCap, text: "Help me prepare for an exam" },
  { icon: CalendarDays, text: "Create a study timetable" },
  { icon: Lightbulb, text: "Give me project ideas" }
];

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function sendMessage(text = input) {
    const prompt = text.trim();
    if (!prompt || loading) return;
    const nextMessages = [...messages, { role: "user", text: prompt }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          history: messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", text: m.text }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "The AI request could not be completed.");
      setMessages(current => [...current, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setError(e.message || "Could not connect to the AI service.");
    } finally {
      setLoading(false);
    }
  }

  function clearChat() { setMessages([]); setError(""); }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard may be blocked by browser permissions */ }
  }

  return <section className="ai-chat-panel">
    <div className="ai-chat-top">
      <div className="ai-bot-avatar"><Bot size={22}/></div>
      <div className="ai-chat-title"><h2>Campus AI Assistant</h2><p><span className="online-dot"/> Ready to help with your college work</p></div>
      <button className="ai-clear-btn" onClick={clearChat} disabled={!messages.length}><Trash2 size={16}/> Clear chat</button>
    </div>
    <div className="ai-chat-body">
      {messages.length === 0 ? <div className="ai-welcome">
        <div className="ai-welcome-icon"><Sparkles size={27}/></div>
        <h2>Hey there! How can I help?</h2>
        <p>Ask me questions, understand difficult topics, prepare for exams or plan your studies.</p>
        <div className="ai-suggestions">{suggestions.map(({icon:Icon,text})=><button key={text} onClick={()=>sendMessage(text)}><Icon size={17}/><span>{text}</span><Send size={14}/></button>)}</div>
      </div> : <div className="ai-message-list">
        {messages.map((m,i)=><div className={`ai-message ${m.role}`} key={i}>
          <div className="ai-message-avatar">{m.role==="assistant"?<Bot size={17}/>:<UserRound size={17}/>}</div>
          <div className="ai-message-content"><div className="ai-message-name">{m.role==="assistant"?"Campus AI":"You"}</div><div className="ai-message-text">{m.text}</div>{m.role==="assistant"&&<button className="ai-copy" onClick={()=>copyText(m.text)}><Copy size={13}/> Copy</button>}</div>
        </div>)}
        {loading&&<div className="ai-message assistant"><div className="ai-message-avatar"><Bot size={17}/></div><div className="ai-message-content"><div className="ai-message-name">Campus AI</div><div className="ai-typing"><i/><i/><i/></div></div></div>}
        <div ref={endRef}/>
      </div>}
    </div>
    {error&&<div className="ai-error">{error}<span> Check that the backend is running and GEMINI_API_KEY is set in server/.env.</span></div>}
    <form className="ai-compose" onSubmit={e=>{e.preventDefault();sendMessage();}}>
      <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Message Campus AI... (Enter to send, Shift + Enter for new line)" rows="2"/>
      <button type="submit" disabled={!input.trim()||loading}><Send size={18}/></button>
    </form>
    <div className="ai-disclaimer">AI can make mistakes. Verify important academic or administrative information.</div>
  </section>;
}
