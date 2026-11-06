"use client";

import { useEffect, useRef } from "react";

type Petal = { x:number; y:number; size:number; speed:number; drift:number; rotation:number; spin:number; alpha:number; depth:number; shape:number };
export function SakuraPetals({ count=34, opacity=.72, wind=.32, zIndex=0 }: { count?:number; opacity?:number; wind?:number; zIndex?:number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas=canvasRef.current; const ctx=canvas?.getContext("2d"); if(!canvas||!ctx)return;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduced)return;
    let width=0,height=0,raf=0,last=0,windNow=wind;
    const petals:Petal[]=[];
    const resize=()=>{const dpr=Math.min(window.devicePixelRatio||1,2);width=window.innerWidth;height=window.innerHeight;canvas.width=width*dpr;canvas.height=height*dpr;canvas.style.width=width+"px";canvas.style.height=height+"px";ctx.setTransform(dpr,0,0,dpr,0,0)};
    const make=(randomY=true):Petal=>{const depth=Math.random();return{x:Math.random()*width,y:randomY?Math.random()*height:-20,size:3+depth*8,speed:.35+depth*1.25,drift:(Math.random()-.5)*.8,rotation:Math.random()*Math.PI*2,spin:(Math.random()-.5)*.025,alpha:.25+depth*.65,depth,shape:Math.floor(Math.random()*3)}};
    resize();for(let i=0;i<count;i++)petals.push(make());
    const onMove=(e:MouseEvent)=>{windNow=wind+(e.clientX/Math.max(width,1)-.5)*.55};
    const draw=(time:number)=>{if(time-last<28){raf=requestAnimationFrame(draw);return}last=time;ctx.clearRect(0,0,width,height);
      for(const p of petals){p.y+=p.speed;p.x+=p.drift+windNow*p.depth;p.rotation+=p.spin;
        if(p.y>height+24||p.x>width+30||p.x<-30){Object.assign(p,make(false));if(p.x>width)p.x=0}
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.globalAlpha=p.alpha*opacity;
        const gradient=ctx.createLinearGradient(-p.size,-p.size,p.size,p.size);gradient.addColorStop(0,"#fff0f5");gradient.addColorStop(1,p.shape===0?"#d88eae":p.shape===1?"#efb8c9":"#c78eaf");ctx.fillStyle=gradient;
        ctx.beginPath();ctx.moveTo(0,-p.size);ctx.bezierCurveTo(p.size*.95,-p.size*.75,p.size*1.1,p.size*.5,0,p.size);ctx.bezierCurveTo(-p.size*1.1,p.size*.5,-p.size*.95,-p.size*.75,0,-p.size);ctx.fill();ctx.restore();
      }raf=requestAnimationFrame(draw)};
    const onVisibility=()=>{if(document.hidden)cancelAnimationFrame(raf);else{last=0;raf=requestAnimationFrame(draw)}};
    window.addEventListener("resize",resize);window.addEventListener("mousemove",onMove,{passive:true});document.addEventListener("visibilitychange",onVisibility);raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);window.removeEventListener("mousemove",onMove);document.removeEventListener("visibilitychange",onVisibility)};
  },[count,opacity,wind]);
  return <canvas ref={canvasRef} aria-hidden="true" style={{position:"fixed",inset:0,pointerEvents:"none",zIndex,opacity}} />;
}
