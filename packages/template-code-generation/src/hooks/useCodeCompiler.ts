"use client";

import { useCallback } from "react";
import * as Babel from "@babel/standalone";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from "remotion";

export interface CompilationResult {
  Component: React.FC | null;
  error: string | null;
}

export function useCodeCompiler() {
  const compile = useCallback((code: string): CompilationResult => {
    if (!code.trim()) {
      return { Component: null, error: "No code provided" };
    }

    try {
      // Transpile JSX/TypeScript to JavaScript using Babel
      const transpiled = Babel.transform(code, {
        presets: ["react", "typescript"],
        filename: "dynamic-animation.tsx",
      });

      if (!transpiled.code) {
        return { Component: null, error: "Transpilation failed" };
      }

      // Create the Remotion API object to inject
      const Remotion = {
        AbsoluteFill,
        interpolate,
        useCurrentFrame,
        useVideoConfig,
        spring,
        Sequence,
      };

      // Create a function that has access to React and Remotion APIs
      // The code should be a function expression that returns a component
      const createComponent = new Function(
        "React",
        "Remotion",
        "AbsoluteFill",
        "interpolate",
        "useCurrentFrame",
        "useVideoConfig",
        "spring",
        "Sequence",
        `
        const DynamicAnimation = ${transpiled.code};
        return DynamicAnimation;
        `
      );

      const Component = createComponent(
        React,
        Remotion,
        AbsoluteFill,
        interpolate,
        useCurrentFrame,
        useVideoConfig,
        spring,
        Sequence
      );

      if (typeof Component !== "function") {
        return {
          Component: null,
          error: "Code must be a function that returns a React component",
        };
      }

      return { Component, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown compilation error";
      return { Component: null, error: errorMessage };
    }
  }, []);

  return { compile };
}
