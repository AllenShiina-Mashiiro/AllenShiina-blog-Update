"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function RegisterPage(){
  const router=useRouter();const [nickname,setNickname]=useState("");const [email,setEmail]=useState("");const [username,setUsername]=useState("");const [password,setPassword]=useState("");const [code,setCode]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
  async function sendCode(){setBusy(true);setMessage("");try{const r=await fetch("/api/auth/verification-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});const d=await r.json();setMessage(d.message||d.error||"请求失败");}catch{setMessage("网络连接失败，请重试。")}finally{setBusy(false)}}
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const r=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nickname,email,username,password,code})});const d=await r.json();if(!r.ok)throw new Error(d.error||"注册失败");router.push("/");router.refresh();}catch(err){setMessage(err instanceof Error?err.message:"注册失败")}finally{setBusy(false)}}
  return <main className="auth-shell"><Link className="auth-brand" href="/">NEXUS ✿</Link><section className="auth-panel glass"><p className="eyebrow">CREATE YOUR SPACE</p><h1>创建账号</h1><p className="auth-hint">用邮箱验证码完成注册，不使用邮件登录链接。</p><form onSubmit={submit} className="auth-form">
    <label>昵称<input value={nickname} onChange={e=>setNickname(e.target.value)} maxLength={60} required placeholder="你的显示名称"/></label>
    <label>邮箱<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@example.com"/></label>
    <label>个人 ID <small>仅限小写字母、数字和下划线，不需要输入 @</small><input value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))} minLength={3} maxLength={30} required placeholder="your_handle"/></label>
    <label>密码<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={10} maxLength={128} required placeholder="至少 10 位"/></label>
    <label>邮箱验证码<div className="code-row"><input inputMode="numeric" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} pattern="[0-9]{6}" required placeholder="六位验证码"/><button type="button" className="secondary-button" onClick={sendCode} disabled={busy||!email}>发送验证码</button></div></label>
    {message&&<p className="form-message" role="status">{message}</p>}<button className="primary-button auth-submit" disabled={busy}>{busy?"请稍候…":"创建账号"} <span>↗</span></button>
  </form><div className="oauth-divider"><span>或使用第三方账号注册</span></div><div className="oauth-actions"><Link href="/api/auth/oauth/google">使用 Google 继续</Link><Link href="/api/auth/oauth/github">使用 GitHub 继续</Link></div><p className="auth-switch">已经有账号？ <Link href="/login">登录</Link></p></section></main>
}
