import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
const labels={DRAFT:"草稿",PUBLISHED:"已发布",ARCHIVED:"已归档"} as const;
export default async function MyContentPage(){
 const user=await getCurrentUser();if(!user)redirect("/login");
 const entries=await prisma.contentEntry.findMany({where:{authorId:user.id},orderBy:{updatedAt:"desc"},take:100,select:{id:true,title:true,slug:true,category:true,status:true,createdAt:true,updatedAt:true,publishedAt:true}});
 return <main className="shell"><header className="topbar glass"><Link className="brand" href="/">NEXUS ✿</Link><Link href="/">首页</Link></header><section className="archive-page glass"><p className="eyebrow">YOUR WRITING DESK</p><h1>我的内容</h1><p className="hero-copy">管理你的草稿、已发布文章与归档内容。</p><div className="entry-list">{entries.map(entry=><article className="entry-card glass my-entry-card" key={entry.id}><div><h2>{entry.title}</h2><p>{entry.category} · {labels[entry.status]}</p><small>更新于 {entry.updatedAt.toLocaleString("zh-CN")}{entry.publishedAt?" · 发布于 "+entry.publishedAt.toLocaleDateString("zh-CN"):""}</small></div><div className="admin-actions"><Link href={"/write/"+entry.id}>编辑</Link>{entry.status==="PUBLISHED"&&<Link href={"/entry/"+entry.slug}>查看</Link>}</div></article>)}{!entries.length&&<div className="empty-state glass">还没有内容，开始写下第一篇吧。</div>}</div><Link className="primary-button" href="/write">写新内容 ↗</Link></section></main>
}
