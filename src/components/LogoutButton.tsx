"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function LogoutButton(){const router=useRouter();const [busy,setBusy]=useState(false);async function logout(){setBusy(true);try{await fetch("/api/auth/logout",{method:"POST"});router.push("/login");router.refresh()}finally{setBusy(false)}}return <button className="login-link logout-button" type="button" onClick={()=>void logout()} disabled={busy}>{busy?"退出中…":"退出"}</button>}
