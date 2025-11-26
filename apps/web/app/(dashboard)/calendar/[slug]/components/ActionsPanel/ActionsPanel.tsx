"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ActionEmptyState from "./ActionEmptyState";
import ActionList from "./ActionList";
import ActionPanelHeader from "./ActionPanelHeader";
import { ActionOverdueKeyframes } from "./actionOverdueStyles";
import { buildActionListItems } from "./utils";
import { useCalendarActionsStore } from "../../stores/useCalendarActionsStore";

export default function ActionsPanel() {
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const actionGroups = useCalendarActionsStore((state) => state.actionGroups);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const indicatorElementRef = useRef<HTMLDivElement | null>(null);
  const [hasIndicator, setHasIndicator] = useState(false);

  const { items, totalActions } = useMemo(() => {
    if (activeTab !== "all") {
      return { items: [], totalActions: 0 };
    }
    return buildActionListItems(actionGroups);
  }, [activeTab, actionGroups]);

  useEffect(() => {
    if (totalActions === 0) {
      indicatorElementRef.current = null;
      setHasIndicator(false);
    }
  }, [totalActions]);

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
          goNowDisabled={activeTab !== "all" || !hasIndicator}
          tabValue={activeTab}
          onTabValueChange={setActiveTab}
          totalActions={totalActions}
        />
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-3"
        >
          {activeTab === "all" ? (
            totalActions === 0 ? (
              <ActionEmptyState />
            ) : (
              <ActionList
                items={items}
                onIndicatorUpdate={handleIndicatorUpdate}
              />
            )
          ) : null}
        </div>
      </div>
    </>
  );
}

