"use client";

import { Header } from "./Header";

interface PageLayoutProps {
  children: React.ReactNode;
  rightContent?: React.ReactNode;
  showLogoAsLink?: boolean;
}

export function PageLayout({
  children,
  rightContent,
  showLogoAsLink = false,
}: PageLayoutProps) {
  return (
    <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col">
      <header className="flex justify-between items-start py-8 px-12 shrink-0">
        <Header asLink={showLogoAsLink} />
        {rightContent}
      </header>
      {children}
    </div>
  );
}
