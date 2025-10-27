import EventDialogShell from "@/app/(dashboard)/calendar/[slug]/@eventModal/EventDialogShell";
import { getEventById } from "@/lib/data/calendar/event/events";
type EventsPageProps = {
  params: { slug: string; eventId: string };
};

export default function EventsPage({ params }: EventsPageProps) {
  return (
    <EventDialogShell>
      <EventDialogContent eventId={params.eventId} />
    </EventDialogShell>
  );
}

async function EventDialogContent({ eventId }: { eventId: string }) {
  const event = await getEventById(eventId);

  return (
    <div className="relative bg-transparent rounded-lg shadow-xl">
      {/* Close Button */}

      <div className="overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Main Content */}
            <div className="flex-1 w-full">
              <EventDetailHeader event={event} />

              {/* Panopto Recording Checks Timeline - Show if event has recording resources */}
              {hasRecordingResource && <Panopto event={event} />}

              {/* Session Setup Components - One for each instructor */}
              {instructorNames.length > 0 &&
                instructorNames.map((instructorName, index) => {
                  const facultyMember = facultyMembers?.find(
                    (fm) => fm.twentyfivelive_name === instructorName
                  );
                  const displayName =
                    facultyMember?.kelloggdirectory_name || instructorName;
                  const lastName = displayName?.split(" ").pop() || displayName;
                  const isCollapsed = Boolean(
                    collapsedProfiles[instructorName]
                  );
                  return (
                    <div
                      key={`session-setup-${index}`}
                      className="  bg-background text-foreground  rounded-xl shadow-2xl border border-white/20 dark:border-white/10 p-3 sm:p-6 mb-8"
                    >
                      <div
                        className="flex items-center justify-between mb-4 cursor-pointer"
                        onClick={() =>
                          setCollapsedProfiles((prev) => ({
                            ...prev,
                            [instructorName]: !isCollapsed,
                          }))
                        }
                      >
                        <h2 className="text-lg sm:text-xl font-semibold ">
                          Faculty Profile{lastName ? ` - ${lastName}` : ""}
                        </h2>
                        <button
                          className="flex items-center justify-center w-8 h-8 backdrop-blur-sm bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 border border-white/20 dark:border-white/10 rounded-full transition-colors shadow-lg"
                          aria-label={
                            isCollapsed
                              ? "Expand session setup"
                              : "Collapse session setup"
                          }
                        >
                          <svg
                            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                              isCollapsed ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                      {!isCollapsed && (
                        <SessionSetup
                          event={event}
                          facultyMembers={facultyMember ? [facultyMember] : []}
                          instructorNames={[instructorName]}
                          isFacultyLoading={isFacultyLoading}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
