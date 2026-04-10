"use client";

import * as React from "react";

interface BuilderLayoutProps {
  content: React.ReactNode;
  preview: React.ReactNode;
}

/**
 * Full-page builder layout: content (65%) + sticky preview panel (35%).
 * Each side scrolls independently.
 */
export function BuilderLayout({ content, preview }: BuilderLayoutProps) {
  return (
    <div className="flex h-full min-h-0 min-w-[1200px]">
      {/* Content — scrollable */}
      <div className="flex-[65] min-w-0 overflow-y-auto">{content}</div>

      {/* Preview — sticky, independent scroll */}
      <div className="flex-[35] sticky top-0 h-screen overflow-hidden flex flex-col">
        {preview}
      </div>
    </div>
  );
}
