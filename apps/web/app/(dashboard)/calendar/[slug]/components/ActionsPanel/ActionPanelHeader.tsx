"use client";

import { useCallback } from "react";
import { ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ActionPanelHeaderProps = {
  onGoToNow?: () => void;
  goNowDisabled?: boolean;
  totalActions: number;
  tabValue: "all" | "mine";
  onTabValueChange?: (value: "all" | "mine") => void;
};

export default function ActionPanelHeader({
  onGoToNow,
  goNowDisabled = false,
  totalActions,
  tabValue,
  onTabValueChange,
}: ActionPanelHeaderProps) {
  const totalLabel =
    totalActions === 1 ? "1 total action" : `${totalActions} total actions`;
  const handleTabValueChange = useCallback(
    (nextValue: string) => {
      if (nextValue === "all" || nextValue === "mine") {
        onTabValueChange?.(nextValue);
      }
    },
    [onTabValueChange]
  );

  const showTotalBadge = tabValue === "all";

  return (
    <header className="border-b px-4 py-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold leading-none">Action View</h2>
          {showTotalBadge ? (
            <Badge variant="secondary" className="text-xs font-medium">
              {totalLabel}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3">
          <Tabs
            value={tabValue}
            onValueChange={handleTabValueChange}
            className="flex-1"
          >
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="all">All Actions</TabsTrigger>
              <TabsTrigger value="mine">My Actions</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="icon"
            onClick={onGoToNow}
            disabled={goNowDisabled}
            aria-label="Scroll to current time"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1"></div>
      </div>
    </header>
  );
}

