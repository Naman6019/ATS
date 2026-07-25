import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Add a cron secret in your .env to secure this endpoint
// CRON_SECRET=your_super_secret_string

export async function GET(request: Request) {
  try {
    // 1. Verify Authorization (Uncomment when deploying to production with a secret)
    // const authHeader = request.headers.get("authorization");
    // const cronSecret = process.env.CRON_SECRET;
    // if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    console.log("Starting Daily Job Search Agent...");

    // 2. Get all active agent preferences
    const activePreferences = await prisma.jobSearchPreference.findMany({
      where: { isActive: true },
    });

    if (activePreferences.length === 0) {
      return NextResponse.json({ message: "No active agents to run" });
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    let totalSaved = 0;

    for (const pref of activePreferences) {
      try {
        console.log(`Running agent for user ${pref.userId} - Query: ${pref.query}`);
        
        let fetchedJobs: any[] = [];
        
        if (!apiKey) {
          // Mock data if no API key
          fetchedJobs = [
            {
              id: `mock-${Date.now()}-1`,
              title: `${pref.query} (Agent Found)`,
              company: "Tech Corp",
              location: pref.location || "Remote",
              salary: "$120k - $150k",
              description: "This job was found by your automated agent.",
              url: "#"
            }
          ];
        } else {
          // Call JSearch API
          const searchParams = new URLSearchParams({
            query: `${pref.query} ${pref.location}`,
            page: "1",
            num_pages: "1"
          });
          
          const response = await fetch(`https://jsearch.p.rapidapi.com/search?${searchParams.toString()}`, {
            headers: {
              "X-RapidAPI-Key": apiKey,
              "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
            },
            next: { revalidate: 3600 }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
              fetchedJobs = data.data.slice(0, 5).map((job: any) => ({
                id: job.job_id,
                title: job.job_title,
                company: job.employer_name,
                location: `${job.job_city || ''}, ${job.job_state || ''}`.trim().replace(/^,|,$/g, ''),
                salary: job.job_min_salary ? `$${job.job_min_salary} - $${job.job_max_salary}` : 'Not Specified',
                description: job.job_description?.substring(0, 300) + "...",
                url: job.job_apply_link
              }));
            }
          }
        }

        // Filter and save new jobs
        if (fetchedJobs.length > 0) {
          // Get user's existing applications to avoid duplicates
          const existingApps = await prisma.jobApplication.findMany({
            where: { userId: pref.userId },
            select: { companyName: true, jobTitle: true }
          });
          
          const existingSet = new Set(
            existingApps.map(a => `${a.companyName}-${a.jobTitle}`.toLowerCase())
          );
          
          let userSaved = 0;
          for (const job of fetchedJobs) {
            const key = `${job.company}-${job.title}`.toLowerCase();
            if (!existingSet.has(key)) {
              await prisma.jobApplication.create({
                data: {
                  userId: pref.userId,
                  companyName: job.company,
                  jobTitle: job.title,
                  status: "SAVED",
                  notes: "Automatically saved by your Job Search Agent."
                }
              });
              userSaved++;
              totalSaved++;
            }
          }
          console.log(`Saved ${userSaved} new jobs for user ${pref.userId}`);
        }

        // Update last run time
        await prisma.jobSearchPreference.update({
          where: { id: pref.id },
          data: { lastRun: new Date() }
        });

      } catch (err) {
        console.error(`Error processing agent for user ${pref.userId}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Agent run complete. Processed ${activePreferences.length} preferences. Saved ${totalSaved} new jobs total.` 
    });

  } catch (error: any) {
    console.error("Agent Cron Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
