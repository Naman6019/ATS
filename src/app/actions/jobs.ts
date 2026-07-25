"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ensureUser } from "@/lib/user";

export async function getJobListings() {
  return await prisma.jobListing.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getJobApplications() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  return await prisma.jobApplication.findMany({
    where: { userId: user.id },
    include: {
      job: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function applyToJob(jobId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  // Check if already applied/saved
  const existing = await prisma.jobApplication.findFirst({
    where: {
      userId: user.id,
      jobId,
    }
  });

  if (existing) {
    if (existing.status !== "APPLIED") {
      await prisma.jobApplication.update({
        where: { id: existing.id },
        data: { status: "APPLIED", appliedDate: new Date() }
      });
    }
  } else {
    await prisma.jobApplication.create({
      data: {
        userId: user.id,
        jobId,
        status: "APPLIED",
        appliedDate: new Date()
      }
    });
  }

  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/tracker");
  return { success: true };
}

export async function saveJob(jobId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  const existing = await prisma.jobApplication.findFirst({
    where: {
      userId: user.id,
      jobId,
    }
  });

  if (!existing) {
    await prisma.jobApplication.create({
      data: {
        userId: user.id,
        jobId,
        status: "SAVED"
      }
    });
  }

  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard/tracker");
  return { success: true };
}

export async function updateApplicationStatus(id: string, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  await prisma.jobApplication.update({
    where: { id, userId: user.id },
    data: { status }
  });

  revalidatePath("/dashboard/tracker");
  return { success: true };
}

// Add a manual job that isn't on the board
export async function addManualApplication(companyName: string, jobTitle: string, status: string = "APPLIED") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  await prisma.jobApplication.create({
    data: {
      userId: user.id,
      companyName,
      jobTitle,
      status,
      appliedDate: status === "APPLIED" ? new Date() : null,
    }
  });

  revalidatePath("/dashboard/tracker");
  return { success: true };
}
