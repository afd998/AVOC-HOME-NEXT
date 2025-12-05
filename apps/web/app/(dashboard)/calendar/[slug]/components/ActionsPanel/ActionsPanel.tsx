"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ActionEmptyState from "./ActionEmptyState";
import ActionList from "./ActionList";
import ActionPanelHeader from "./ActionPanelHeader";
import { ActionOverdueKeyframes } from "./actionOverdueStyles";
import { buildActionListItems } from "./utils";
import { useActionsQuery } from "@/lib/query";
import ActionAssignments from "../ActionAssignments/ActionAssignments";
import { useEventAssignmentsStore } from "@/lib/stores/event-assignments";
import { supabase } from "@/lib/supabase";

type ActionsPanelProps = {
  date: string;
  filter: string;
  autoHide: boolean;
};

export default function ActionsPanel({
  date,
  filter,
  autoHide,
}: ActionsPanelProps) {
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const { data: actionGroups = [] } = useActionsQuery({ date, filter, autoHide });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const indicatorElementRef = useRef<HTMLDivElement | null>(null);
  const [hasIndicator, setHasIndicator] = useState(false);
  const { showEventAssignments } = useEventAssignmentsStore();

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        setIsLoadingUser(true);
        const { data, error } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (error) {
          console.error("[ActionsPanel] Failed to get user", error);
        }
        setCurrentUserId(data.user?.id ?? null);
      } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        setCurrentUserId(session?.user?.id ?? null);
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const filteredActionGroups = useMemo(() => {
    if (activeTab !== "mine") return actionGroups;
    if (!currentUserId) return [];

    return actionGroups
      .map((group) => ({
        ...group,
        actions: group.actions.filter(
          (action) => {
            // Manual assignee takes precedence over auto assignments
            const effectiveAssigneeId =
              action.assignedToManual ??
              action.assignedToManualProfile?.id ??
              action.assignedTo ??
              action.assignedToProfile?.id ??
              null;

            return effectiveAssigneeId === currentUserId;
          }
        ),
      }))
      .filter((group) => group.actions.length > 0);
  }, [actionGroups, activeTab, currentUserId]);

  const { items, totalActions } = useMemo(
    () => buildActionListItems(filteredActionGroups),
    [filteredActionGroups]
  );

  useEffect(() => {
    if (totalActions === 0) {
      indicatorElementRef.current = null;
      setHasIndicator(false);
    }
  }, [totalActions]);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  useEffect(() => {
    if (!showEventAssignments) {
      setShowSchedule(false);
    }
  }, [showEventAssignments]);

  const handleIndicatorUpdate = useCallback(
    (element: HTMLDivElement | null) => {
      indicatorElementRef.current = element;
      setHasIndicator(Boolean(element));
    },
    []
  );

  const handleGoToNow = useCallback(() => {
    const container = scrollContainerRef.current;
    const indicator = indicatorElementRef.current;
    if (!container || !indicator) return;

    const containerRect = container.getBoundingClientRect();
    const indicatorRect = indicator.getBoundingClientRect();
    const relativePosition = indicatorRect.top - containerRect.top;
    const desiredOffset = container.clientHeight * 0.25;
    const targetScrollTop =
      container.scrollTop + relativePosition - desiredOffset;

    container.scrollTo({
      top: Math.max(targetScrollTop, 0),
      behavior: "smooth",
    });
  }, []);

  return (
    <>
      <ActionOverdueKeyframes />
      <div className="flex h-full flex-col">
        <ActionPanelHeader
          onGoToNow={handleGoToNow}
          goNowDisabled={!hasIndicator}
          tabValue={activeTab}
          onTabValueChange={setActiveTab}
          totalActions={totalActions}
          onOpenSchedule={() => setShowSchedule(true)}
        />
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-3"
        >
          {activeTab === "mine" && isLoadingUser ? (
            <ActionEmptyState message="Loading your actions..." />
          ) : totalActions === 0 ? (
            <ActionEmptyState
              message={
                activeTab === "mine"
                  ? "No actions assigned to you for this date."
                  : undefined
              }
            />
          ) : (
            <ActionList
              items={items}
              onIndicatorUpdate={handleIndicatorUpdate}
              hideAssignedAvatar={activeTab === "mine"}
            />
          )}
        </div>
        <ActionAssignments
          dates={[date]}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          open={showSchedule}
          onOpenChange={setShowSchedule}
          hideTrigger
          showShiftBlockLines={false}
        />
      </div>
    </>
  );
}
