"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
type Entry={id:string;title:string;slug:string;category:string;status:"DRAFT"|"PUBLISHED"|"ARCHIVED";author:{nickname:string;username:string};updatedAt:string};
export default function AdminContentPage(){
 const [entries,setEntries]=useState<Entry[]>([]),[message,setMessage]=useState("");
 async function load(){const r=await fetch("/api/admin/content");const d=await r.json();if(!r.ok){setMessage(d.error||"加载失败");return}setEntries(d.entries)}
 useEffect(()=>{void load()},[]);
 async function status(entry:Entry,value:Entry["status"]){const r=await fetch("/api/admin/content",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:entry.id,status:value})});const d=await r.json();if(!r.ok){setMessage(d.error||"更新失败");return}setEntries(v=>v.map(x=>x.id===entry.id?{...x,status:value}:x))}
 async function remove(entry:Entry){if(!confirm("确定永久删除《"+entry.title+"》？"))return;const r=await fetch("/api/admin/content",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:entry.id})});if(r.ok)setEntries(v=>v.filter(x=>x.id!==entry.id));else setMessage((await r.json()).error||"删除失败")}
 return <main className="shell"><header className="topbar glass"><Link className="brand" href="/">NEXUS ✿</Link><Link href="/admin">管理后台</Link></header><section className="admin-page glass"><p className="eyebrow">CONTENT MODERATION</p><h1>内容审核</h1>{message&&<p className="form-message">{message}</p>}<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>内容</th><th>作者</th><th>分类</th><th>状态</th><th>管理</th></tr></thead><tbody>{entries.map(e=><tr key={e.id}><td><strong>{e.title}</strong><small>{new Date(e.updatedAt).toLocaleString("zh-CN")}</small></td><td>@{e.author.username}</td><td>{e.category}</td><td><select value={e.status} onChange={x=>void status(e,x.target.value as Entry["status"])}><option value="DRAFT">草稿</option><option value="PUBLISHED">公开</option><option value="ARCHIVED">隐藏归档</option></select></td><td><div className="admin-actions">{e.status==="PUBLISHED"&&<Link href={"/entry/"+e.slug}>查看</Link>}<button onClick={()=>void remove(e)}>删除</button></div></td></tr>)}</tbody></table></div></section></main>
}
