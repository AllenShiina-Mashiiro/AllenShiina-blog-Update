import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";

const sections = [
  { key: "STUDY", title: "学习笔记", description: "记录思考，让知识慢慢生长。" },
  { key: "RESOURCE", title: "资源", description: "收集值得留存的工具与资料。" },
  { key: "LIFE", title: "生活", description: "日常片段与灵感存档。" },
  { key: "ARTICLE", title: "文章", description: "完整表达与长期写作。" },
];

export default async function HomePage() {
  const [viewer, announcements, latest] = await Promise.all([getCurrentUser(), prisma.announcement.findMany({where:{isActive:true},orderBy:{createdAt:"desc"},take:3,select:{id:true,title:true,body:true,createdAt:true}}), prisma.contentEntry.findMany({where:{status:"PUBLISHED"},orderBy:{publishedAt:"desc"},take:6,select:{id:true,title:true,slug:true,excerpt:true,category:true,publishedAt:true,author:{select:{nickname:true,username:true}}}})]);
  const [unreadCount, pinned] = viewer ? await Promise.all([
    prisma.notification.count({where:{recipientId:viewer.id,readAt:null}}),
    prisma.contentPin.findMany({where:{userId:viewer.id,entry:{status:"PUBLISHED"}},orderBy:{position:"asc"},take:8,include:{entry:{select:{id:true,title:true,slug:true,excerpt:true,category:true}}}})
  ]) : [0, []];
  return (
    <main className="shell">
      <header className="topbar glass">
        <Link className="brand" href="/">NEXUS<span>✿</span></Link>
        <nav aria-label="主导航">
          <Link href="/category/study">学习笔记</Link><Link href="/category/resource">资源</Link><Link href="/category/life">生活</Link><Link href="/category/article">文章</Link>
        </nav>
        <div className="home-account"><Link className="login-link" href="/search">搜索</Link><Link className="login-link" href="/members">成员</Link>{viewer ? <><Link className="login-link" href={`/u/${viewer.username}`}>@{viewer.username}</Link><Link className="login-link" href="/account">资料</Link><Link className="login-link" href="/bookmarks">收藏</Link><Link className="login-link" href="/write">写作</Link><Link className="login-link" href="/my-content">我的内容</Link><Link className="login-link notification-link" href="/notifications">通知{unreadCount>0&&<span className="unread-badge">{unreadCount>99?"99+":unreadCount}</span>}</Link>{viewer.role === "ADMIN" && <Link className="login-link" href="/admin">管理</Link>}<LogoutButton /></> : <Link className="login-link" href="/login">登录 / 注册</Link>}</div>
      </header>
      {announcements.length > 0 && <section className="home-announcements">{announcements.map(item => <article className="glass" key={item.id}><strong>{item.title}</strong><p>{item.body}</p><small>{item.createdAt.toLocaleDateString("zh-CN")}</small></article>)}</section>}
      {pinned.length>0&&<section className="pinned-home"><div className="section-heading"><div><p className="eyebrow">YOUR PINNED COLLECTION</p><h2>我的主页置顶</h2></div><Link className="quiet-link" href={"/u/"+viewer!.username}>查看个人主页 ↗</Link></div><div className="entry-list">{pinned.map(item=><Link className="entry-card glass" href={"/entry/"+item.entry.slug} key={item.id}><div><h3>{item.entry.title}</h3><p>{item.entry.excerpt||"暂无摘要"}</p><small>{item.entry.category}</small></div><span>✦</span></Link>)}</div></section>}
      <section className="hero">
        <p className="eyebrow">PERSONAL SPACE · EST. 2026</p>
        <h1>把喜欢的事物，<br/><em>认真地收藏起来。</em></h1>
        <p className="hero-copy">一个关于学习、资源、生活与创作的个人空间。</p>
        <div className="hero-actions"><a className="primary-button" href="#archive">探索归档 <span>↗</span></a><Link className="quiet-link" href="/about">关于 NEXUS</Link></div>
      </section>
      <section id="archive" className="archive">
        <div className="section-heading"><div><p className="eyebrow">THE ARCHIVE</p><h2>内容空间</h2></div><span>01 — 04</span></div>
        <div className="section-grid">
          {sections.map((section, index) => <Link className="section-card glass" id={section.key.toLowerCase()} href={`/category/${section.key.toLowerCase()}`} key={section.key}>
            <span className="card-index">0{index + 1}</span><span className="card-flower">✿</span><h3>{section.title}</h3><p>{section.description}</p><span className="card-arrow">↗</span>
          </Link>)}
        </div>
      </section>
      <section className="latest-section"><div className="section-heading"><div><p className="eyebrow">RECENT JOURNAL</p><h2>最近发布</h2></div><Link className="quiet-link" href="/search">浏览全部 ↗</Link></div><div className="entry-list">{latest.map(entry=><article className="entry-card glass" key={entry.id}><div><Link href={"/entry/"+entry.slug}><h2>{entry.title}</h2></Link><p>{entry.excerpt||"暂无摘要"}</p><small><Link href={"/u/"+entry.author.username}>{entry.author.nickname}</Link> · {entry.category} · {entry.publishedAt?.toLocaleDateString("zh-CN")}</small></div><Link href={"/entry/"+entry.slug} aria-label={"阅读 "+entry.title}>↗</Link></article>)}{!latest.length&&<div className="empty-state glass">还没有公开发布的内容。</div>}</div></section>
      <footer><span>NEXUS</span><span>Made with care · 2026</span></footer>
    </main>
  );
}
