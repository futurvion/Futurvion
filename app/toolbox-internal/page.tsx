import { Directory } from "@/features/toolbox/directory";
import { AdSlot } from "@/features/toolbox/shell";
import { utilityMetadata } from "@/features/toolbox/catalog";
export const metadata = utilityMetadata("Free Developer Tools", "Free browser-based JSON, JWT, cron, regex, Base64 and API response utilities. No login required.");
export default function Page() { return <><Directory /><AdSlot placement="directory"/></>; }
