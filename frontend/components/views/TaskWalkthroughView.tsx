import React, { useState, useEffect, useRef } from 'react';
import { Bot, ArrowRight, Lock } from 'lucide-react';
import { Card, Badge } from '../ui/Primitives';
import { ChatMessage } from '../../types';

export const TaskWalkthroughView = ({ repoId }: { repoId: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: '1', role: 'system', content: "I'm your AI repo assistant. Ask me anything about the codebase." }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = async (textOverride?: string) => {
    const messageText = typeof textOverride === 'string' ? textOverride : input;
    if (!messageText.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: messageText }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_id: repoId, message: messageText, history: [] })
      });
      if (!res.ok) throw new Error('Backend unreachable');
      const data = await res.json();
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'system', content: data.response }]);
    } catch (error) {
      console.warn("Backend unreachable, using Simulation.");
      setTimeout(() => {
         setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'system', content: "Backend disconnected. Simulating response: Try running 'npm install'." }]);
      }, 800);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2"><Bot className="text-blue-600" size={20} /><h3 className="font-semibold text-slate-900">Gemini Agent</h3></div>
          <Badge variant="blue">AI Connected</Badge>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && <div className="text-slate-400 text-sm p-4">AI is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-slate-100 bg-white relative">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" disabled={isLoading} />
          <button onClick={() => handleSend()} disabled={isLoading} className="absolute right-6 top-6"><ArrowRight className="text-slate-400 h-4 w-4" /></button>
        </div>
      </Card>
      <div className="space-y-6">
         <Card className="p-6"><h3 className="text-sm font-semibold text-slate-900 mb-4">Suggested Prompts</h3><div className="space-y-2">{['Fix security issues', 'Why won't it run?', 'Docker setup'].map((q, i) => <button key={i} onClick={() => handleSend(q)} className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all">{q}</button>)}</div></Card>
      </div>
    </div>
  );
};