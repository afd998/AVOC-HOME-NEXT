import type { Faculty } from "shared/db/types";
import SessionSetups from "./SessionSetups";
import { getFacultySetups } from "@/lib/data/faculty";

export default async function SessionSetupsServer({
  facultyMember,
}: {
  facultyMember: Faculty;
}) {
  // Add delay to test Suspense fallback
 
  
  const setups = await getFacultySetups(facultyMember?.id || 0);
  return <SessionSetups facultyMember={facultyMember} setups={setups} />;
}
