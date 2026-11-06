import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { EntryInteractions } from "@/components/EntryInteractions";
export default async function EntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const viewer = await getCurrentUser();
  const entry = await prisma.contentEntry.findFirst({ where: { slug, status: "PUBLISHED" }, include: { author: { select: { nickname: true, username: true, avatarUrl: true } }, _count: { select: { reactions: true } } } });
  if (!entry) notFound();
  const [, liked, saved] = await Promise.all([
    prisma.contentEntry.update({ where: { id: entry.id }, data: { viewCount: { increment: 1 } } }),
    viewer ? prisma.reaction.findUnique({ where: { entryId_userId: { entryId: entry.id, userId: viewer.id } }, select: { id: true } }) : null,
    viewer ? prisma.bookmark.findUnique({ where: { entryId_userId: { entryId: entry.id, userId: viewer.id } }, select: { id: true } }) : null
  ]);
  return <main className="shell"><header className="topbar glass"><Link className="brand" href="/">NEXUS<span>✿</span></Link><Link className="login-link" href="/login">登录</Link></header><article className="article-page glass"><Link className="quiet-link" href={`/category/${entry.category.toLowerCase()}`}>← 返回分类</Link><p className="eyebrow">{entry.category} · NEXUS JOURNAL</p><h1>{entry.title}</h1><p className="article-meta">{entry.author.nickname} · @{entry.author.username} · {entry.publishedAt?.toLocaleDateString("zh-CN")} · {entry.viewCount + 1} 次阅读</p>{entry.coverUrl&&<img className="article-cover" src={entry.coverUrl} alt="文章封面"/>}<div className="article-body">{entry.body}</div><EntryInteractions entryId={entry.id} initialLikes={entry._count.reactions} initialLiked={Boolean(liked)} initialSaved={Boolean(saved)} /></article></main>;
}
