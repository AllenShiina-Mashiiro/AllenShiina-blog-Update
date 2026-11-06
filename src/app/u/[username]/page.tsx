import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
export default async function ProfilePage({params}:{params:Promise<{username:string}>}){
 const {username}=await params;const user=await prisma.user.findUnique({where:{username:username.toLowerCase()},include:{entries:{where:{status:"PUBLISHED"},orderBy:{publishedAt:"desc"},select:{id:true,title:true,slug:true,excerpt:true,category:true,publishedAt:true}}}});
 if(!user)notFound();
 return <main className="shell"><header className="topbar glass"><Link className="brand" href="/">NEXUS<span>✿</span></Link><Link className="login-link" href="/">首页</Link></header><section className="profile-page glass">{user.coverUrl&&<div className="profile-cover" style={{backgroundImage:`url("${user.coverUrl}")`}}/>}<div className="profile-heading">{user.avatarUrl?<img src={user.avatarUrl} alt="头像"/>:<div className="profile-avatar">{user.nickname.slice(0,1)}</div>}<div><h1>{user.nickname}</h1><p>@{user.username}</p></div></div>{user.bio&&<p className="profile-bio">{user.bio}</p>}<p className="profile-joined">加入于 {user.createdAt.toLocaleDateString("zh-CN")}</p><h2>公开内容</h2><div className="entry-list">{user.entries.map(entry=><Link className="entry-card glass" href={`/entry/${entry.slug}`} key={entry.id}><div><h3>{entry.title}</h3><p>{entry.excerpt}</p><small>{entry.category} · {entry.publishedAt?.toLocaleDateString("zh-CN")}</small></div><span>↗</span></Link>)}{!user.entries.length&&<div className="empty-state">暂时还没有公开内容。</div>}</div></section></main>
}
