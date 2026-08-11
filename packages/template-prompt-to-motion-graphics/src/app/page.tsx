"use client";

import { LandingPageInput } from "@/components/LandingPageInput";
import { PageLayout } from "@/components/PageLayout";
import type { ModelId } from "@/types/generation";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Home: NextPage = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigate = (
    prompt: string,
    model: ModelId,
    attachedImages?: string[],
  ) => {
    setIsNavigating(true);
    // Store images in sessionStorage (too large for URL params)
    if (attachedImages && attachedImages.length > 0) {
      sessionStorage.setItem(
        "initialAttachedImages",
        JSON.stringify(attachedImages),
      );
    } else {
      sessionStorage.removeItem("initialAttachedImages");
    }
    const params = new URLSearchParams({ prompt, model });
    router.push(`/generate?${params.toString()}`);
  };

  return (
    <PageLayout>
      <LandingPageInput
        onNavigate={handleNavigate}
        isNavigating={isNavigating}
        showCodeExamplesLink
      />
    </PageLayout>
  );
};

export default Home;
