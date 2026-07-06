"use client";
import { useEffect, useState } from "react";

type PageConn={id:string;pageId:string;pageName:string;channel:string;isActive:boolean;createdAt:string};
export default function PagesClient(){
  const [pages,setPages]=useState<PageConn[]>([]);
  const [form,setForm]=useState({pageName:"",pageId:"",channel:"messenger",accessToken:""});
  async function load(){const r=await fetch("/api/pages");const d=await r.json();setPages(d.pages||[])}
  useEffect(()=>{load()},[]);
  async function save(){
    const r=await fetch("/api/pages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    const d=await r.json(); if(!r.ok){alert(d.error||"Failed");return;}
    setForm({pageName:"",pageId:"",channel:"messenger",accessToken:""}); load();
  }
  return <div className="wrap">
    <div className="panel" style={{marginBottom:14}}><div className="panel-h"><b>Add Meta Page</b></div><div className="panel-b form">
      <div className="hint">প্রতিটা Facebook/Instagram page-এর Page ID এবং Page Access Token add করুন। Token database-এ encrypted থাকবে।</div>
      <div className="form-row"><label>Page name</label><input value={form.pageName} onChange={e=>setForm({...form,pageName:e.target.value})}/></div>
      <div className="form-row"><label>Page ID</label><input value={form.pageId} onChange={e=>setForm({...form,pageId:e.target.value})}/></div>
      <div className="form-row"><label>Channel</label><select value={form.channel} onChange={e=>setForm({...form,channel:e.target.value})}><option value="messenger">Facebook Messenger</option><option value="instagram">Instagram DM</option></select></div>
      <div className="form-row"><label>Page Access Token</label><textarea rows={3} value={form.accessToken} onChange={e=>setForm({...form,accessToken:e.target.value})}/></div>
      <button className="primary" onClick={save}>Save Page</button>
    </div></div>
    <table className="table"><thead><tr><th>Page</th><th>Page ID</th><th>Channel</th><th>Status</th></tr></thead><tbody>{pages.map(p=><tr key={p.id}><td>{p.pageName}</td><td>{p.pageId}</td><td>{p.channel}</td><td>{p.isActive?<span className="ok">Active</span>:<span className="danger">Off</span>}</td></tr>)}</tbody></table>
  </div>
}
