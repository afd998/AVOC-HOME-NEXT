import { ReactNode } from "react";

interface EventPageContentProps {
  children: ReactNode;
}

export default function EventPageContent({ children }: EventPageContentProps) {
  return (
    <div className="bg-background rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
      {children}
    </div>
  );
}

