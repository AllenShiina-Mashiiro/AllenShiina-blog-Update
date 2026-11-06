import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createUserSession } from "@/lib/session";
const schema = z.object({ email: z.string().email().max(320), password: z.string().min(1).max(128) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "邮箱或密码格式不正确。" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.trim().toLowerCase() } });
  if (!user || !user.passwordHash || user.isBanned || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "邮箱或密码错误。" }, { status: 401 });
  }
  await createUserSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, nickname: user.nickname, username: `@${user.username}` } });
}
