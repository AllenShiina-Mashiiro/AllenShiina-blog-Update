"use client";
import { useState } from "react";
type Props={onUploaded:(urls:string[])=>void};
export default function MultiImageUploadField({onUploaded}:Props){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function upload(files:FileList|null){
  if(!files?.length)return;
  const selected=Array.from(files);
  if(selected.length>20){setMessage("一次最多选择 20 张图片。");return}
  const oversized=selected.find(file=>file.size>20*1024*1024);
  if(oversized){setMessage("每张图片必须在 20MB 以内："+oversized.name);return}
  setBusy(true);setMessage("正在上传 "+selected.length+" 张图片…");
  const urls:string[]=[];let failures=0;
  for(const file of selected){
   try{const data=new FormData();data.set("file",file);const response=await fetch("/api/media",{method:"POST",body:data});const result=await response.json();if(!response.ok)throw new Error(result.error||"上传失败");urls.push(result.asset.url)}
   catch{failures++}
  }
  if(urls.length)onUploaded(urls);
  setMessage(failures?("成功上传 "+urls.length+" 张，"+failures+" 张失败。"):("已成功上传 "+urls.length+" 张图片。"));
  setBusy(false);
 }
 return <div className="image-upload-field multi-image-upload"><label>批量上传正文图片（最多 20 张，每张不超过 20MB）<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple disabled={busy} onChange={e=>{void upload(e.currentTarget.files);e.currentTarget.value=""}}/></label>{message&&<p className="form-message" role="status">{message}</p>}</div>;
}
