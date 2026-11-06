"use client";
import { useEffect,useState } from "react";
export default function ThemeToggle(){
 const [light,setLight]=useState(false);
 useEffect(()=>{const saved=window.localStorage.getItem("nexus-theme");const enabled=saved==="light";setLight(enabled);document.documentElement.dataset.theme=enabled?"light":"dark"},[]);
 function toggle(){const next=!light;setLight(next);document.documentElement.dataset.theme=next?"light":"dark";window.localStorage.setItem("nexus-theme",next?"light":"dark")}
 return <button type="button" className="theme-toggle" onClick={toggle} aria-label={light?"切换深色模式":"切换浅色模式"}>{light?"☾":"☼"}</button>;
}
