"use client";
import { FormEvent,useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function LoginPage(){
  const router=useRouter();const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[message,setMessage]=useState("");const[busy,setBusy]=useState(false);
  useEffect(()=>{const error=new URLSearchParams(window.location.search).get("error");if(error)setMessage(error)},[]);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok)throw new Error(d.error||"登录失败");router.push("/");router.refresh()}catch(err){setMessage(err instanceof Error?err.message:"登录失败")}finally{setBusy(false)}}
  return <main className="auth-shell"><Link className="auth-brand" href="/">NEXUS ✿</Link><section className="auth-panel glass"><p className="eyebrow">WELCOME BACK</p><h1>欢迎回来</h1><p className="auth-hint">登录后继续你的收藏与创作。</p><form onSubmit={submit} className="auth-form"><label>邮箱<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@example.com"/></label><label>密码<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="你的密码"/></label>{message&&<p className="form-message" role="alert">{message}</p>}<button className="primary-button auth-submit" disabled={busy}>{busy?"正在登录…":"登录"} <span>↗</span></button></form><div className="oauth-divider"><span>或使用第三方账号</span></div><div className="oauth-actions"><Link href="/api/auth/oauth/google">使用 Google 继续</Link><Link href="/api/auth/oauth/github">使用 GitHub 继续</Link></div><p className="auth-switch">还没有账号？ <Link href="/register">立即注册</Link></p></section></main>
}
