import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import EditEntryForm from "@/components/EditEntryForm";
export default async function EditPage({params}:{params:Promise<{id:string}>}){
 const user=await getCurrentUser();if(!user)redirect("/login");
 const {id}=await params;const entry=await prisma.contentEntry.findUnique({where:{id}});
 if(!entry||(entry.authorId!==user.id&&user.role!=="ADMIN"))notFound();
 return <main className="shell"><header className="topbar glass"><Link className="brand" href="/">NEXUS ✿</Link><Link href="/">首页</Link></header><EditEntryForm id={entry.id} title={entry.title} excerpt={entry.excerpt||""} body={entry.body} coverUrl={entry.coverUrl||""} category={entry.category} status={entry.status}/></main>
}
