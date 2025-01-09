import { z } from "zod";
import { getThemeColors } from "@code-hike/lighter";
import React from "react";

export type ThemeColors = Awaited<ReturnType<typeof getThemeColors>>;

export const themeSchema = z.enum([
  "dark-plus",
  "dracula-soft",
  "dracula",
  "github-dark",
  "github-dark-dimmed",
  "github-light",
  "light-plus",
  "material-darker",
  "material-default",
  "material-lighter",
  "material-ocean",
  "material-palenight",
  "min-dark",
  "min-light",
  "monokai",
  "nord",
  "one-dark-pro",
  "poimandres",
  "slack-dark",
  "slack-ochin",
  "solarized-dark",
  "solarized-light",
]);

export type Theme = z.infer<typeof themeSchema>;

export const ThemeColorsContext = React.createContext<ThemeColors | null>(null);

export const useThemeColors = () => {
  const themeColors = React.useContext(ThemeColorsContext);
  if (!themeColors) {
    throw new Error("ThemeColorsContext not found");
  }

  return themeColors;
};

export const ThemeProvider = ({
  children,
  themeColors,
}: {
  readonly children: React.ReactNode;
  readonly themeColors: ThemeColors;
}) => {
  return (
    <ThemeColorsContext.Provider value={themeColors}>
      {children}
    </ThemeColorsContext.Provider>
  );
};
