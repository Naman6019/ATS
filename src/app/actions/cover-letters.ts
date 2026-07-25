"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ensureUser } from "@/lib/user";

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  return await prisma.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCoverLetter(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  return await prisma.coverLetter.findFirst({
    where: { id, userId: user.id },
  });
}

export async function saveCoverLetter(id: string | null, title: string, content: string, targetRole: string = "", targetCompany: string = "") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  if (id) {
    const letter = await prisma.coverLetter.update({
      where: { id, userId: user.id },
      data: { title, content, targetRole, targetCompany },
    });
    revalidatePath("/dashboard/cover-letters");
    return letter;
  } else {
    const letter = await prisma.coverLetter.create({
      data: {
        userId: user.id,
        title,
        content,
        targetRole,
        targetCompany,
      },
    });
    revalidatePath("/dashboard/cover-letters");
    return letter;
  }
}

export async function deleteCoverLetter(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  await prisma.coverLetter.delete({
    where: { id, userId: user.id },
  });

  revalidatePath("/dashboard/cover-letters");
  return { success: true };
}
