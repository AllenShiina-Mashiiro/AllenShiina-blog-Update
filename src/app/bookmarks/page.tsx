import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
export default async function BookmarksPage(){
 const user=await getCurrentUser();if(!user)redirect("/login");
 const items=await prisma.bookmark.findMany({where:{userId:user.id,entry:{status:"PUBLISHED"}},orderBy:{createdAt:"desc"},include:{entry:{select:{title:true,slug:true,excerpt:true,category:true,publishedAt:true,author:{select:{nickname:true,username:true}}}}}});
 return <main className="shell"><header className="topbar glass"><Link className="brand" href="/">NEXUS<span>✿</span></Link><Link className="login-link" href="/">首页</Link></header><section className="archive-page glass"><p className="eyebrow">YOUR COLLECTION</p><h1>我的收藏</h1><div className="entry-list">{items.map(item=><Link className="entry-card glass" href={"/entry/"+item.entry.slug} key={item.entry.slug}><div><h2>{item.entry.title}</h2><p>{item.entry.excerpt||"暂无摘要"}</p><small><Link href={"/u/"+item.entry.author.username}>{item.entry.author.nickname}</Link> · {item.entry.category} · 收藏于 {item.createdAt.toLocaleDateString("zh-CN")}</small></div><span>↗</span></Link>)}{!items.length&&<div className="empty-state">你还没有收藏文章。</div>}</div></section></main>
}
