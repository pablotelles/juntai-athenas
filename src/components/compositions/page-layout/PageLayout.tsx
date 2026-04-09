import * as React from "react";
import { cn } from "@/lib/cn";

export interface PageLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ sidebar, children, className }: PageLayoutProps) {
  return (
    <div
      className={cn("flex h-screen overflow-hidden bg-background", className)}
    >
      {/* Sidebar — fixed width, full height */}
      <div className="flex-none h-full">{sidebar}</div>

      {/* Main — scrollable */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollable?: boolean;
}

export function PageContent({
  scrollable = true,
  className,
  ...props
}: PageContentProps) {
  return (
    <main
      className={cn("flex-1 p-6", scrollable && "overflow-y-auto", className)}
      {...props}
    />
  );
}
