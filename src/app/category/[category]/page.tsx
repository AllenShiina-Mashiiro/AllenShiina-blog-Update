import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
const categories = {
  study: { key: "STUDY" as const, title: "学习笔记", description: "记录思考，让知识慢慢生长。" },
  resource: { key: "RESOURCE" as const, title: "资源", description: "收集值得留存的工具与资料。" },
  life: { key: "LIFE" as const, title: "生活", description: "日常片段与灵感存档。" },
  article: { key: "ARTICLE" as const, title: "文章", description: "完整表达与长期写作。" },
};
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!Object.hasOwn(categories, category)) notFound();
  const config = categories[category as keyof typeof categories];
  const entries = await prisma.contentEntry.findMany({ where: { category: config.key, status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true, updatedAt: true, author: { select: { nickname: true, username: true } } } });
  return <main className="shell"><header className="topbar glass"><Link className="brand" href="/">NEXUS<span>✿</span></Link><nav><Link href="/category/study">学习笔记</Link><Link href="/category/resource">资源</Link><Link href="/category/life">生活</Link><Link href="/category/article">文章</Link></nav><Link className="login-link" href="/login">登录</Link></header><section className="archive-page"><p className="eyebrow">THE ARCHIVE / {config.key}</p><h1>{config.title}</h1><p className="hero-copy">{config.description}</p><div className="entry-list">{entries.length ? entries.map(entry=><Link className="entry-card glass" href={`/entry/${entry.slug}`} key={entry.id}><div><h2>{entry.title}</h2><p>{entry.excerpt || "打开文章，继续阅读。"}</p><small><Link href={"/u/"+entry.author.username}>{entry.author.nickname}</Link> · {entry.publishedAt?.toLocaleDateString("zh-CN") || entry.updatedAt.toLocaleDateString("zh-CN")}</small></div><span>↗</span></Link>) : <div className="empty-state glass">这里暂时还没有公开内容。</div>}</div><Link className="quiet-link" href="/">← 返回首页</Link></section></main>;
}
