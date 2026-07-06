import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function sinceFor(range:string){
  const d=new Date();
  if(range==="30d")d.setDate(d.getDate()-30);
  else if(range==="7d")d.setDate(d.getDate()-7);
  else d.setHours(0,0,0,0);
  return d;
}

export async function GET(req:Request){
  const url=new URL(req.url);
  const range=url.searchParams.get("range")||"today";
  const since=sinceFor(range);
  const outgoing=await prisma.message.findMany({where:{direction:"outgoing",createdAt:{gte:since}},orderBy:{createdAt:"asc"}});
  const incoming=await prisma.message.findMany({where:{direction:"incoming"},orderBy:{createdAt:"asc"},select:{conversationId:true,createdAt:true}});
  const incomingByConv=new Map<string,Date[]>();
  incoming.forEach(m=>{const arr=incomingByConv.get(m.conversationId)||[];arr.push(m.createdAt);incomingByConv.set(m.conversationId,arr);});
  const stats=new Map<string,{agentName:string;outgoing:number;conv:Set<string>;responseMinutes:number[]}>();
  for(const m of outgoing){
    const agent=m.agentName || "Unknown";
    const s=stats.get(agent)||{agentName:agent,outgoing:0,conv:new Set<string>(),responseMinutes:[]};
    s.outgoing++; s.conv.add(m.conversationId);
    const prev=(incomingByConv.get(m.conversationId)||[]).filter(t=>t.getTime()<=m.createdAt.getTime()).pop();
    if(prev){
      const mins=(m.createdAt.getTime()-prev.getTime())/60000;
      if(mins>=0 && mins<1440) s.responseMinutes.push(mins);
    }
    stats.set(agent,s);
  }
  const rows=Array.from(stats.values()).map(s=>({
    agentName:s.agentName,
    outgoing:s.outgoing,
    conversations:s.conv.size,
    avgResponseMinutes:s.responseMinutes.length ? s.responseMinutes.reduce((a,b)=>a+b,0)/s.responseMinutes.length : null
  })).sort((a,b)=>b.outgoing-a.outgoing);
  return NextResponse.json({rows,summary:{totalAgents:rows.length,totalOutgoing:outgoing.length}});
}
