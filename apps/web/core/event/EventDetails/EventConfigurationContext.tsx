"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { EventConfigurationUpdates } from "@/lib/actions/updateEventConfiguration";

interface EventConfigurationContextValue {
  isEditable: boolean;
  onUpdate: (updates: EventConfigurationUpdates) => Promise<void>;
}

const EventConfigurationContext = createContext<EventConfigurationContextValue | undefined>(
  undefined
);

export function EventConfigurationProvider({
  children,
  isEditable,
  onUpdate,
}: {
  children: ReactNode;
  isEditable: boolean;
  onUpdate: (updates: EventConfigurationUpdates) => Promise<void>;
}) {
  return (
    <EventConfigurationContext.Provider value={{ isEditable, onUpdate }}>
      {children}
    </EventConfigurationContext.Provider>
  );
}

export function useEventConfiguration() {
  const context = useContext(EventConfigurationContext);
  if (context === undefined) {
    throw new Error(
      "useEventConfiguration must be used within an EventConfigurationProvider"
    );
  }
  return context;
}

