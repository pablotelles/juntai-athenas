"use client";

import * as React from "react";

interface BuilderLayoutProps {
  content: React.ReactNode;
  preview: React.ReactNode;
}

/**
 * Full-page builder layout: content (65%) + sticky preview panel (35%).
 * - Mobile (<md): content only, preview hidden (handled in Phase 3).
 * - Tablet (md→lg): stacked — content on top, preview panel below with fixed height.
 * - Desktop (lg+): side-by-side, each side scrolls independently.
 */
export function BuilderLayout({ content, preview }: BuilderLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:h-full lg:min-h-0">
      {/* Content — natural scroll on mobile/tablet, independent scroll on desktop */}
      <div className="flex-1 min-w-0 lg:flex-65 lg:overflow-y-auto">
        {content}
      </div>

      {/* Preview — hidden on mobile, bottom panel on tablet, sticky side panel on desktop */}
      <div className="hidden md:flex md:flex-col md:h-72 lg:h-screen lg:flex-35 lg:sticky lg:top-0 lg:overflow-hidden border-t border-border lg:border-t-0 lg:border-l">
        {preview}
      </div>
    </div>
  );
}
