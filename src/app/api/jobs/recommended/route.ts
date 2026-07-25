import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureUser } from "@/lib/user";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "software engineer";
    const location = searchParams.get("location") || "";
    
    const fullQuery = location ? `${query} in ${location}` : query;

    const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.JSEARCH_API_KEY;

    if (!rapidApiKey) {
      // Mock data for development if API key is not present
      console.warn("No RAPIDAPI_KEY provided. Returning mock job data.");
      return NextResponse.json([
        {
          id: "mock-job-1",
          title: "Senior Full Stack Developer",
          company: "TechNova Solutions",
          location: "San Francisco, CA (Remote)",
          salary: "$120k - $160k",
          description: "We are looking for an experienced Full Stack Developer to lead our new product initiatives. You will work with React, Next.js, and Node.js.",
          url: "https://example.com/job/1"
        },
        {
          id: "mock-job-2",
          title: "Frontend Engineer (React)",
          company: "Innovate LLC",
          location: "New York, NY",
          salary: "$100k - $140k",
          description: "Join our dynamic frontend team to build beautiful and responsive user interfaces using modern React features and Tailwind CSS.",
          url: "https://example.com/job/2"
        },
        {
          id: "mock-job-3",
          title: "Backend Software Engineer",
          company: "CloudScale Inc.",
          location: "Seattle, WA",
          salary: "$130k - $170k",
          description: "Help us scale our cloud infrastructure. Strong experience in Node.js, PostgreSQL, and distributed systems is required.",
          url: "https://example.com/job/3"
        }
      ]);
    }

    const res = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(fullQuery)}&page=1&num_pages=1`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch jobs from JSearch API");
    }

    const data = await res.json();
    
    // Transform JSearch data to match our frontend interface
    const jobs = data.data.map((job: any) => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : job.job_location || "Remote",
      salary: job.job_min_salary && job.job_max_salary 
        ? `$${(job.job_min_salary/1000).toFixed(0)}k - $${(job.job_max_salary/1000).toFixed(0)}k` 
        : "",
      description: job.job_description ? job.job_description.substring(0, 300) + "..." : "",
      url: job.job_apply_link || job.job_google_link || "#"
    }));

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching recommended jobs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
