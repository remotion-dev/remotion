import { isInsideStudio } from "@remotion/studio-protocol";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { StudioActions } from "../components/studio-actions";

export default function LibraryLayout() {
  const location = useLocation();
  const [hydrated, setHydrated] = useState(false);
  const search = hydrated ? location.search : "";
  const [insideStudio, setInsideStudio] = useState(false);

  const isCaptionPicker =
    insideStudio &&
    new URLSearchParams(search).get("remotion-studio-context") === "captions";

  useEffect(() => {
    setHydrated(true);
    setInsideStudio(isInsideStudio());
  }, []);

  return (
    <div
      data-embedded={insideStudio}
      data-caption-picker={isCaptionPicker}
      className="group/site isolate flex min-h-dvh flex-col"
    >
      <a
        className="absolute -top-24 left-6 z-50 bg-white p-3 focus:top-3"
        href="#main"
      >
        Skip to content
      </a>
      {!insideStudio && (
        <header className="border-b border-neutral-950/10">
          <div className="mx-auto flex min-h-18 max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 sm:px-8 lg:px-12">
            <div className="min-w-0 shrink-0 grow text-lg font-semibold tracking-tight">
              <Link
                className="inline-flex items-center gap-2.5"
                aria-label="Homepage"
                to={{ pathname: "/", search }}
              >
                <img src="/favicon.svg" alt="" className="size-6 shrink-0" />
                Studio Supply
              </Link>
            </div>
            {(location.pathname === "/" ||
              location.pathname.replace(/\/$/, "") === "/captions") && (
              <div className="w-full min-w-0 sm:w-auto sm:max-w-80">
                <StudioActions entry={null} variant="default" />
              </div>
            )}
          </div>
        </header>
      )}
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 group-data-[caption-picker=true]/site:max-w-none group-data-[caption-picker=true]/site:px-3 sm:px-8 lg:px-12">
        <Outlet context={{ insideStudio, isCaptionPicker, search }} />
      </div>
    </div>
  );
}
