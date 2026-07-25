"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ensureUser } from "@/lib/user";

export async function getAgentPreference() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  return await prisma.jobSearchPreference.findUnique({
    where: { userId: user.id }
  });
}

export async function updateAgentPreference(query: string, location: string, isActive: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  const preference = await prisma.jobSearchPreference.upsert({
    where: { userId: user.id },
    update: {
      query,
      location,
      isActive,
    },
    create: {
      userId: user.id,
      query,
      location,
      isActive,
    }
  });

  revalidatePath("/dashboard/jobs");
  return preference;
}

export async function toggleAgentPreference(isActive: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  // User must have an existing preference to toggle it, or we throw error / return null
  const existing = await prisma.jobSearchPreference.findUnique({
    where: { userId: user.id }
  });

  if (!existing) {
    throw new Error("No agent preference found to toggle");
  }

  const preference = await prisma.jobSearchPreference.update({
    where: { userId: user.id },
    data: { isActive }
  });

  revalidatePath("/dashboard/jobs");
  return preference;
}
