"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
export default function MarkdownBody({content}:{content:string}){
 const [selected,setSelected]=useState<string|null>(null);
 return <><div className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={{img({src,alt}){if(!src)return null;return <button type="button" className="markdown-image-button" onClick={()=>setSelected(src)} aria-label="查看原图"><img src={src} alt={alt||""}/></button>}}}>{content}</ReactMarkdown></div>{selected&&<div className="image-lightbox" role="dialog" aria-modal="true" onClick={()=>setSelected(null)}><button type="button" className="lightbox-close" onClick={()=>setSelected(null)} aria-label="关闭">×</button><a className="lightbox-download" href={selected} download onClick={e=>e.stopPropagation()}>下载原图</a><img src={selected} alt="原图预览" onClick={e=>e.stopPropagation()}/></div>}</>;
}
