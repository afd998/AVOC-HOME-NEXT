"use client";

import * as React from "react";

import { Sheet } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const MOBILE_BREAKPOINT = 768;
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>();

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

type SidebarState = "expanded" | "collapsed";

type SidebarContextProps = {
  state: SidebarState;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar(): SidebarContextProps {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarShell");
  }

  return context;
}

type SidebarProviderProps = {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  children,
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    if (openProp !== undefined) return;

    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`));

    if (!cookie) return;

    const stored = cookie.split("=")[1];
    if (stored === "true" || stored === "false") {
      _setOpen(stored === "true");
    }
  }, [openProp]);

  const open = openProp ?? _open;

  const setOpen = React.useCallback<React.Dispatch<React.SetStateAction<boolean>>>(
    (value) => {
      const nextOpen = typeof value === "function" ? value(open) : value;

      if (onOpenChange) {
        onOpenChange(nextOpen);
      } else {
        _setOpen(nextOpen);
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${nextOpen}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [open, onOpenChange, _setOpen]
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  }, [isMobile, setOpen]);

  React.useEffect(() => {
    if (!isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state: SidebarState = open ? "expanded" : "collapsed";

  const value = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

type SidebarShellProps = React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type SidebarShellContentProps = Omit<
  SidebarShellProps,
  "defaultOpen" | "open" | "onOpenChange"
>;

function SidebarShellContent({
  side,
  variant,
  collapsible,
  className,
  children,
  style,
  ...props
}: SidebarShellContentProps) {
  const { isMobile, openMobile, setOpenMobile, state } = useSidebar();

  const childArray = React.Children.toArray(children).filter(
    (child) => !(typeof child === "string" && child.trim().length === 0)
  );
  const [sidebarChild, ...restChildren] = childArray;

  const sidebar = React.isValidElement(sidebarChild) ? sidebarChild : null;

  return (
    <div
      data-slot="sidebar-wrapper"
      data-side={side}
      data-variant={variant}
      data-collapsible={collapsible}
      data-state={state}
      className={cn(
        "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
        className
      )}
      style={
        {
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {isMobile && sidebar ? (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          {sidebar}
        </Sheet>
      ) : (
        sidebar
      )}
      {restChildren}
    </div>
  );
}

export function SidebarShell({
  defaultOpen = true,
  open,
  onOpenChange,
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  style,
  ...props
}: SidebarShellProps) {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
    >
      <TooltipProvider delayDuration={0}>
        <SidebarShellContent
          side={side}
          variant={variant}
          collapsible={collapsible}
          className={className}
          style={style}
          {...props}
        >
          {children}
        </SidebarShellContent>
      </TooltipProvider>
    </SidebarProvider>
  );
}

export function SidebarRail({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  );
}
