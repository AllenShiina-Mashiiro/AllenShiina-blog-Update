"use client";
import { useState } from "react";
export default function ImageUploadField({onUploaded}:{onUploaded:(url:string)=>void}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function upload(file?:File){if(!file)return;setBusy(true);setMessage("");try{const data=new FormData();data.set("file",file);const response=await fetch("/api/media",{method:"POST",body:data});const result=await response.json();if(!response.ok)throw new Error(result.error||"上传失败");onUploaded(result.asset.url);setMessage("上传成功，图片 Markdown 已插入正文。")}catch(error){setMessage(error instanceof Error?error.message:"上传失败")}finally{setBusy(false)}}
 return <div className="image-upload-field"><label>插入图片（JPG / PNG / WebP / GIF / AVIF，最大 20MB）<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={busy} onChange={e=>void upload(e.target.files?.[0])}/></label>{message&&<p className="form-message">{message}</p>}</div>;
}
