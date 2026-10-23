import { JobsBoard } from "@/features/jobs/components/jobs-board";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Jobs", "Discover opportunities in technology, design, marketing, product and business.", "/jobs");

export default function JobsPage() {
  return <JobsBoard/>;
}
