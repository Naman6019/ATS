"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ensureUser } from "@/lib/user";

export async function saveResume(id: string | null, title: string, template: string, data: any) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await ensureUser(userId);

  const stringifiedData = JSON.stringify(data);

  let resume;
  if (id) {
    // Update existing
    resume = await prisma.resume.update({
      where: { id },
      data: {
        title,
        template,
        data: stringifiedData
      }
    });
  } else {
    // Create new
    resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title,
        template,
        data: stringifiedData
      }
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/build");
  
  return resume.id;
}

export async function getResumes() {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }

  const user = await ensureUser(userId);

  return await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function getResume(id: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const user = await ensureUser(userId);

  const resume = await prisma.resume.findUnique({
    where: { id }
  });

  if (!resume || resume.userId !== user.id) {
    return null;
  }

  return {
    ...resume,
    data: JSON.parse(resume.data)
  };
}
