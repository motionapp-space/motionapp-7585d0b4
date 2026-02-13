import { Users, FileText, Calendar, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
  TooltipPortal,
} from "@/components/ui/tooltip";

type NavItem = { label: string; to: string; icon: React.ElementType };

const NAV_ITEMS: NavItem[] = [
  { label: "Clienti", to: "/", icon: Users },
  { label: "Agenda", to: "/calendar", icon: Calendar },
  { label: "Libreria", to: "/library", icon: FileText },
  { label: "Impostazioni", to: "/settings", icon: Settings },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onNavClick?: () => void;
}

export function AppSidebar({ collapsed = false, onNavClick }: AppSidebarProps) {
  const { pathname } = useLocation();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        data-sidebar="root"
        className={cn(
          "sticky top-0 h-screen shrink-0 bg-sidebar text-sidebar-foreground flex flex-col transition-[width] duration-200 ease-in-out",
          collapsed ? "w-16" : "w-[232px]"
        )}
        data-testid="sidebar"
      >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center",
        collapsed ? "justify-center px-2" : "px-5"
      )}>
        {collapsed ? (
          <span className="text-xl font-bold tracking-tight text-primary">M</span>
        ) : (
          <span className="text-xl font-bold tracking-tight">Motion</span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 pt-3">
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.to === "/"
                ? pathname === "/" ||
                  pathname.startsWith("/clients") ||
                  pathname.startsWith("/client-plans") ||
                  pathname.startsWith("/session/live")
                : item.to === "/library"
                ? pathname.startsWith("/library") ||
                  pathname.startsWith("/templates")
                : pathname.startsWith(item.to);

            const navLinkContent = (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavClick}
                className={cn(
                  "group relative flex items-center rounded-full transition-[background-color,color] duration-[120ms] ease-out",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-sidebar-hover focus-visible:text-sidebar-foreground",
                  collapsed
                    ? "justify-center px-2 py-2.5"
                    : "gap-3 px-3 py-2.5",
                  active
                    ? "bg-sidebar-active text-sidebar-foreground font-semibold"
                    : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
                )}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
              >
                {/* Active indicator bar */}
                {active && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[28px] bg-[hsl(var(--accent))]" />
                )}
                {active && collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-[hsl(var(--accent))]" />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <span className="text-base leading-6">{item.label}</span>
                )}
              </NavLink>
            );

            // Show tooltip only when collapsed
            if (collapsed) {
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    {navLinkContent}
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              );
            }

            return navLinkContent;
          })}
        </nav>
      </div>
      </aside>
    </TooltipProvider>
  );
}
