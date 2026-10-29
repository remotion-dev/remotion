import { useEffect, useRef, useState } from "react";
import type { ElementDefinition } from "../../elements/registry";
import previews from "../../elements/previews.json";

const previewsBySlug = new Map(Object.entries(previews));

export const RenderedPreview = ({
  definition,
  playing,
}: {
  definition: ElementDefinition;
  playing: boolean;
}) => {
  const assets = previewsBySlug.get(definition.slug);
  const video = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [failed, setFailed] = useState(false);
  const shouldPlay = playing && !reducedMotion && !failed;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);

    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setFailed(false);
  }, [playing, assets?.videoUrl]);

  useEffect(() => {
    const element = video.current;

    if (!element) return;
    let canceled = false;
    element.play().catch(() => {
      if (!canceled) setFailed(true);
    });

    return () => {
      canceled = true;
      element.pause();
    };
  }, [shouldPlay, assets?.videoUrl]);

  if (!assets) {
    return (
      <div className="w-full p-4 text-center text-base text-muted sm:text-sm">
        Run render-previews
      </div>
    );
  }

  return (
    <div className="pointer-events-none relative w-full" aria-hidden>
      <img
        alt=""
        src={assets.posterUrl}
        width={definition.width}
        height={definition.height}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="w-full"
      />
      {shouldPlay ? (
        <video
          ref={video}
          src={assets.videoUrl}
          poster={assets.posterUrl}
          muted
          loop
          playsInline
          preload="none"
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full"
        />
      ) : null}
    </div>
  );
};
