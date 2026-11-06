import Link from "next/link";
import { prisma } from "@/lib/prisma";
export default async function AboutPage(){
 const setting=await prisma.siteSetting.findUnique({where:{key:"site.about"},select:{value:true}});
 const about=typeof setting?.value==="string"?setting.value:"这里是一个用于收藏知识、资源、生活片段与个人创作的空间。\n\n把喜欢的事物认真地整理，把正在经历的日子慢慢记录。";
 return <main className="shell"><header className="topbar glass"><Link className="brand" href="/">NEXUS<span>✿</span></Link><Link className="login-link" href="/">返回首页</Link></header><section className="about-page glass"><p className="eyebrow">ABOUT THIS SPACE</p><h1>关于 NEXUS</h1><div className="about-copy">{about.split("\n").map((line,index)=>line?<p key={index}>{line}</p>:<div className="about-spacer" key={index}/>)}</div></section></main>
}
