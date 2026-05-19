import { getThemeColors } from "@code-hike/lighter";
import React from "react";
import { z } from "zod";
import {themeSchema} from './theme-schema';
import {ThemeColorsContext} from './theme-context';
import {useThemeColors} from './useThemeColors';

export type ThemeColors = Awaited<ReturnType<typeof getThemeColors>>;


export type Theme = z.infer<typeof themeSchema>;


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
