"use client";

import { useCallback, useState, useEffect, useMemo, useRef } from "react";
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
import * as RemotionShapes from "@remotion/shapes";
import { Lottie } from "@remotion/lottie";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";

export interface CompilationResult {
  Component: React.FC | null;
  error: string | null;
}

// Extract component body from full ES6 code with imports
function extractComponentBody(code: string): string {
  // Strip import lines
  const lines = code.split("\n");
  const nonImportLines = lines.filter(
    (line) => !line.trim().startsWith("import ")
  );
  const codeWithoutImports = nonImportLines.join("\n");

  // Extract body from "export const MyAnimation = () => { ... };"
  const match = codeWithoutImports.match(
    /export\s+const\s+\w+\s*=\s*\(\s*\)\s*=>\s*\{([\s\S]*)\};?\s*$/
  );
  if (match) {
    return match[1].trim();
  }

  // Fallback: return code as-is (backward compatible with body-only input)
  return code;
}

export function useCodeCompiler() {
  const compile = useCallback((code: string): CompilationResult => {
    if (!code.trim()) {
      return { Component: null, error: "No code provided" };
    }

    try {
      // Extract component body (handles both full ES6 code and body-only)
      const componentBody = extractComponentBody(code);

      // Wrap the component body in a function BEFORE transpilation
      const wrappedSource = `const DynamicAnimation = () => {\n${componentBody}\n};`;

      // Transpile JSX/TypeScript to JavaScript using Babel
      const transpiled = Babel.transform(wrappedSource, {
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

      // Add return statement for the Function constructor
      const wrappedCode = `${transpiled.code}\nreturn DynamicAnimation;`;

      const createComponent = new Function(
        "React",
        "Remotion",
        "RemotionShapes",
        "Lottie",
        "ThreeCanvas",
        "THREE",
        "AbsoluteFill",
        "interpolate",
        "useCurrentFrame",
        "useVideoConfig",
        "spring",
        "Sequence",
        "useState",
        "useEffect",
        "useMemo",
        "useRef",
        "Rect",
        "Circle",
        "Triangle",
        "Star",
        "Polygon",
        "Ellipse",
        "Heart",
        "Pie",
        "makeRect",
        "makeCircle",
        "makeTriangle",
        "makeStar",
        "makePolygon",
        "makeEllipse",
        "makeHeart",
        "makePie",
        wrappedCode,
      );

      const Component = createComponent(
        React,
        Remotion,
        RemotionShapes,
        Lottie,
        ThreeCanvas,
        THREE,
        AbsoluteFill,
        interpolate,
        useCurrentFrame,
        useVideoConfig,
        spring,
        Sequence,
        useState,
        useEffect,
        useMemo,
        useRef,
        RemotionShapes.Rect,
        RemotionShapes.Circle,
        RemotionShapes.Triangle,
        RemotionShapes.Star,
        RemotionShapes.Polygon,
        RemotionShapes.Ellipse,
        RemotionShapes.Heart,
        RemotionShapes.Pie,
        RemotionShapes.makeRect,
        RemotionShapes.makeCircle,
        RemotionShapes.makeTriangle,
        RemotionShapes.makeStar,
        RemotionShapes.makePolygon,
        RemotionShapes.makeEllipse,
        RemotionShapes.makeHeart,
        RemotionShapes.makePie,
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
