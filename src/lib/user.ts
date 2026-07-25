import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function ensureUser(clerkId: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId }
  });

  if (!user) {
    const clerkUser = await currentUser();
    user = await prisma.user.create({
      data: {
        clerkId,
        email: clerkUser?.emailAddresses[0]?.emailAddress || "",
        name: `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim()
      }
    });
  }

  return user;
}
