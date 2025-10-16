import { faculty, facultySetup } from "@/drizzle/schema";
import { InferSelectModel } from "drizzle-orm";
import SessionSetups from "./SessionSetups";
import { getFacultySetups } from "@/lib/data/faculty";

export default async function SessionSetupsServer({
  facultyMember,
}: {
  facultyMember: InferSelectModel<typeof faculty>;

}) {
  // Add delay to test Suspense fallback
 
  
  const setups = await getFacultySetups(facultyMember?.id || 0);
  return <SessionSetups facultyMember={facultyMember} setups={setups} />;
}
