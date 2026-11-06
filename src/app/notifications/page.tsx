import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
export default async function NotificationsPage(){
 const user=await getCurrentUser();if(!user)redirect("/login");
 const items=await prisma.notification.findMany({where:{recipientId:user.id},orderBy:{createdAt:"desc"},take:50,include:{actor:{select:{nickname:true}}}});
 await prisma.notification.updateMany({where:{recipientId:user.id,readAt:null},data:{readAt:new Date()}});
 return <main className="shell"><header className="topbar glass"><Link className="brand" href="/">NEXUS<span>✿</span></Link><Link className="login-link" href="/">返回首页</Link></header><section className="archive-page"><p className="eyebrow">YOUR INBOX</p><h1>通知中心</h1><div className="entry-list">{items.map(item=><Link className="entry-card glass" href={item.targetUrl||"/"} key={item.id}><div><h2>{item.title}</h2><p>{item.body||item.actor?.nickname||"系统通知"}</p><small>{item.createdAt.toLocaleString("zh-CN")}</small></div><span>↗</span></Link>)}{!items.length&&<div className="empty-state glass">目前没有新通知。</div>}</div></section></main>
}
