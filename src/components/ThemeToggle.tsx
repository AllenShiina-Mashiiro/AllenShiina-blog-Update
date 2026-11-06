"use client";
import { useEffect,useState } from "react";
const DEFAULT_ACCENT="#e9b8c9";
export default function ThemeToggle({defaultAccent=DEFAULT_ACCENT,defaultTheme="dark"}:{defaultAccent?:string;defaultTheme?:"dark"|"light"}){
 const [light,setLight]=useState(defaultTheme==="light"),[accent,setAccent]=useState(defaultAccent);
 useEffect(()=>{const savedTheme=window.localStorage.getItem("nexus-theme");const enabled=savedTheme?savedTheme==="light":defaultTheme==="light";const savedAccent=window.localStorage.getItem("nexus-accent");const nextAccent=savedAccent&&/^#[0-9a-f]{6}$/i.test(savedAccent)?savedAccent:defaultAccent;setLight(enabled);setAccent(nextAccent);document.documentElement.dataset.theme=enabled?"light":"dark";document.documentElement.style.setProperty("--rose",nextAccent)},[defaultAccent,defaultTheme]);
 function toggle(){const next=!light;setLight(next);document.documentElement.dataset.theme=next?"light":"dark";window.localStorage.setItem("nexus-theme",next?"light":"dark")}
 function changeAccent(value:string){setAccent(value);document.documentElement.style.setProperty("--rose",value);window.localStorage.setItem("nexus-accent",value)}
 return <div className="theme-controls"><label className="accent-picker" title="自定义主题强调色"><span>✿</span><input aria-label="自定义主题强调色" type="color" value={accent} onChange={e=>changeAccent(e.target.value)}/></label><button type="button" className="theme-toggle" onClick={toggle} aria-label={light?"切换深色模式":"切换浅色模式"}>{light?"☾":"☼"}</button></div>;
}
