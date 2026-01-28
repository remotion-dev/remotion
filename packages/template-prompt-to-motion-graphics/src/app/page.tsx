"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { LandingPageInput } from "@/components/LandingPageInput";
import type { ModelId } from "@/types/generation";
import { PageLayout } from "@/components/PageLayout";

const Home: NextPage = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigate = (prompt: string, model: ModelId) => {
    setIsNavigating(true);
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
