// import FacultyStatusBars from './FacultyStatusBars';
import { FacultyAvatar } from "./FacultyAvatar";

import { Plus, ExternalLink } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

interface ResourceItem {
  itemName: string;
  quantity?: number;
  [key: string]: any;
}
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { faculty } from "@/drizzle/schema";
import { getFacultySetups } from "@/lib/data/faculty";
import { Suspense } from "react";
import SessionSetupsServer from "./SessionSetupsServer";
export default async function FacultyProfile({
  facultyMember,
}: {
  facultyMember: InferSelectModel<typeof faculty>;
}) {
  // State for faculty photo hover effects

  // BYOD handled in BYODDevicesCard

  if (!facultyMember) {
    return <div>Faculty member not found</div>;
  }
  return (
    <div className="bg-background text-foreground rounded-xl shadow-2xl border border-white/20 dark:border-white/10 p-3 sm:p-6 mb-12">
      {/* Two Column Layout - BYOD Devices and Setups */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Left Column - BYOD Devices */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Faculty Information - Top of Left Column */}

          <Item variant="outline" className="">
            <ItemMedia>
              {facultyMember?.kelloggdirectoryImageUrl ? (
                <div>
                  <FacultyAvatar
                    imageUrl={facultyMember.kelloggdirectoryImageUrl}
                    cutoutImageUrl={facultyMember.cutoutImage}
                    instructorName={facultyMember.twentyfiveliveName || ""}
                    size="lg"
                    priority={true}
                  />
                </div>
              ) : (
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl">
                    👤
                  </span>
                </div>
              )}
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                <span className="text-base sm:text-lg font-medium  truncate">
                  {(() => {
                    const fullName = facultyMember?.kelloggdirectoryName || "";
                    const nameParts = fullName.split(" ");
                    if (nameParts.length >= 2) {
                      const firstName = nameParts[0];
                      const lastName = nameParts.slice(1).join(" ");
                      return `Dr. ${firstName} - ${lastName}`;
                    }
                    return `Dr. ${fullName}`;
                  })()}
                </span>
              </ItemTitle>
              {facultyMember?.kelloggdirectoryTitle && (
                <ItemDescription className="truncate ">
                  {facultyMember.kelloggdirectoryTitle}
                </ItemDescription>
              )}
            </ItemContent>
            <ItemActions>
              {facultyMember?.kelloggdirectoryBioUrl && (
                <a
                  href={facultyMember.kelloggdirectoryBioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors shrink-0"
                  title="View faculty directory page"
                  aria-label="Open faculty profile"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </ItemActions>
          </Item>

          {/* {instructorNames.length > 0 && facultyMember && (
            <BYODDevicesCard facultyId={facultyMember.id} themeHexColors={themeHexColors as any} />
          )} */}
        </div>

        {/* Right Column - Setups */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          <Suspense fallback={<Skeleton  className=" bg-gray-200 dark:bg-gray-800 h-full w-full" />}>
            <SessionSetupsServer
              facultyMember={facultyMember}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
