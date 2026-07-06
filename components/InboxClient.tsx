"use client";
import { useEffect, useMemo, useState } from "react";
import Pusher from "pusher-js";

type Conversation = {
  id:string; channel:string; status:string; assignedTo?:string|null; tags?:string|null; lastMessage?:string|null; lastMessageAt?:string|null; lastCustomerMessageAt?:string|null;
  page:{ pageName:string; pageId:string; channel:string };
  customer:{ name?:string|null; platformId:string };
};
type Message = { id:string; direction:string; text?:string|null; agentName?:string|null; createdAt:string };

export default function InboxClient(){
  const [conversations,setConversations]=useState<Conversation[]>([]);
  const [selected,setSelected]=useState<string>("");
  const [messages,setMessages]=useState<Message[]>([]);
  const [reply,setReply]=useState("");
  const [agentName,setAgentName]=useState(() => typeof window!=="undefined" ? localStorage.getItem("agentName") || "Shakil" : "Shakil");
  const [q,setQ]=useState("");
  const [status,setStatus]=useState("");
  const [pageFilter,setPageFilter]=useState("");

  async function loadConversations(){
    const params=new URLSearchParams();
    if(q)params.set("q",q); if(status)params.set("status",status); if(pageFilter)params.set("pageId",pageFilter);
    const r=await fetch(`/api/conversations?${params.toString()}`);
    const d=await r.json();
    setConversations(d.conversations||[]);
    if(!selected && d.conversations?.[0]?.id)setSelected(d.conversations[0].id);
  }
  async function loadMessages(id:string){
    if(!id)return;
    const r=await fetch(`/api/conversations/${id}/messages`);
    const d=await r.json(); setMessages(d.messages||[]);
  }
  useEffect(()=>{loadConversations(); const t=setInterval(loadConversations,5000); return()=>clearInterval(t);},[q,status,pageFilter]);
  useEffect(()=>{loadMessages(selected);},[selected]);
  useEffect(()=>{
    const key=process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster=process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";
    if(!key)return;
    const pusher=new Pusher(key,{cluster});
    const ch=pusher.subscribe("unified-inbox");
    ch.bind("new-message",()=>{loadConversations(); if(selected)loadMessages(selected);});
    ch.bind("message-sent",()=>{loadConversations(); if(selected)loadMessages(selected);});
    return()=>{pusher.disconnect();};
  },[selected]);

  const pages=useMemo(()=>Array.from(new Map(conversations.map(c=>[c.page.pageId,c.page.pageName])).entries()),[conversations]);
  const active=conversations.find(c=>c.id===selected);

  async function sendReply(){
    if(!selected||!reply.trim())return;
    localStorage.setItem("agentName",agentName);
    const text=reply.trim(); setReply("");
    const r=await fetch("/api/messages/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversationId:selected,text,agentName})});
    const d=await r.json();
    if(!r.ok){alert(d.error||"Send failed"); setReply(text); return;}
    await loadMessages(selected); await loadConversations();
  }

  function windowBadge(c:Conversation){
    if(!c.lastCustomerMessageAt)return <span className="badge">No window</span>;
    const age=Date.now()-new Date(c.lastCustomerMessageAt).getTime();
    const hours=age/36e5;
    if(hours<20)return <span className="badge green">24h active</span>;
    if(hours<24)return <span className="badge amber">Window ending</span>;
    return <span className="badge red">Expired</span>;
  }

  return <div className="wrap">
    <div className="grid">
      <div className="panel">
        <div className="panel-h"><b>All Inbox</b><span className="badge green">Live</span></div>
        <div className="panel-b">
          <div className="filters">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search customer/message…" />
            <select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All status</option><option>OPEN</option><option>PENDING</option><option>ORDER_CONFIRMED</option><option>CLOSED</option></select>
            <select value={pageFilter} onChange={e=>setPageFilter(e.target.value)}><option value="">All pages</option>{pages.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select>
          </div>
          <div className="conversation-list">
            {conversations.map(c=><div key={c.id} onClick={()=>setSelected(c.id)} className={`conv ${selected===c.id?"active":""}`}>
              <div className="conv-title"><span>{c.customer.name||c.customer.platformId}</span><small>{c.lastMessageAt?new Date(c.lastMessageAt).toLocaleTimeString():""}</small></div>
              <div className="conv-meta"><span>{c.page.pageName}</span><span>•</span><span>{c.channel}</span>{windowBadge(c)}</div>
              <div className="conv-meta">{c.lastMessage||"No message"}</div>
            </div>)}
          </div>
        </div>
      </div>
      <div className="panel chat">
        {!active ? <div className="empty">Select a conversation</div> : <>
          <div className="chat-head">
            <div><b>{active.customer.name||active.customer.platformId}</b><div className="conv-meta">{active.page.pageName} · {active.channel} · {active.status}</div></div>
            <div>{windowBadge(active)}</div>
          </div>
          <div className="messages">
            {messages.map(m=><div key={m.id} className={`msg ${m.direction}`}>
              {m.text || "[Unsupported message]"}
              <div className="time">{new Date(m.createdAt).toLocaleString()} {m.agentName?`· ${m.agentName}`:""}</div>
            </div>)}
          </div>
          <div className="reply">
            <input value={agentName} onChange={e=>setAgentName(e.target.value)} placeholder="Staff name" />
            <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Reply লিখুন…" rows={2} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendReply();}}}/>
            <button className="primary" onClick={sendReply}>Send</button>
          </div>
        </>}
      </div>
    </div>
  </div>
}
