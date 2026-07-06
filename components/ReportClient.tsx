"use client";
import { useEffect, useState } from "react";

type Row={agentName:string;outgoing:number;conversations:number;avgResponseMinutes:number|null};
export default function ReportClient(){
  const [range,setRange]=useState("today");
  const [rows,setRows]=useState<Row[]>([]);
  const [summary,setSummary]=useState({totalOutgoing:0,totalAgents:0});
  async function load(){const r=await fetch(`/api/report/staff?range=${range}`);const d=await r.json();setRows(d.rows||[]);setSummary(d.summary||{totalOutgoing:0,totalAgents:0});}
  useEffect(()=>{load()},[range]);
  return <div className="wrap">
    <div className="panel" style={{marginBottom:14}}><div className="panel-h"><b>Staff Performance Report</b><select value={range} onChange={e=>setRange(e.target.value)}><option value="today">Today</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select></div><div className="panel-b cards">
      <div className="card"><div className="k">Agents</div><div className="v">{summary.totalAgents}</div></div>
      <div className="card"><div className="k">Replies sent</div><div className="v">{summary.totalOutgoing}</div></div>
    </div></div>
    <table className="table"><thead><tr><th>Staff</th><th>Replies</th><th>Conversations</th><th>Avg response time</th></tr></thead><tbody>{rows.map(r=><tr key={r.agentName}><td><b>{r.agentName}</b></td><td>{r.outgoing}</td><td>{r.conversations}</td><td>{r.avgResponseMinutes==null?"—":`${r.avgResponseMinutes.toFixed(1)} min`}</td></tr>)}</tbody></table>
  </div>
}
