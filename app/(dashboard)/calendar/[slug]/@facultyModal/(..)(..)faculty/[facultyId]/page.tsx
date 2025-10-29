import FacultyDialogShell from "@/app/(dashboard)/calendar/[slug]/@facultyModal/FacultyDialogShell";
import FacultyDialogContent from "../FacultyDialogConent";
import FacultyProfile from "@/core/faculty/FacultyProfile";
import { getFacultyById } from "@/lib/data/faculty";

export default async function FacultyModal(props: {
  params: Promise<{ facultyId: string }>;
}) {
  const { facultyId } = await props.params;
  const facultyMember = await getFacultyById(Number(facultyId));
  if (!facultyMember) {
    return <div>Faculty member not found</div>;
  }
  return (
    <FacultyDialogShell>
      <FacultyProfile facultyMember={facultyMember} />
    </FacultyDialogShell>
  );
}
