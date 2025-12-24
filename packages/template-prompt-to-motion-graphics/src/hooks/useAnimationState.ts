"use client";

import { useState, useEffect, useCallback } from "react";
import {
  compileCode as compile,
  type CompilationResult,
} from "../remotion/compiler";

export interface AnimationState {
  code: string;
  Component: React.ComponentType | null;
  error: string | null;
  isCompiling: boolean;
}

export function useAnimationState(initialCode: string = "") {
  const [state, setState] = useState<AnimationState>({
    code: initialCode,
    Component: null,
    error: null,
    isCompiling: false,
  });

  // Compile code when it changes (with debouncing handled by caller)
  const compileCode = useCallback((code: string) => {
    setState((prev) => ({ ...prev, isCompiling: true }));

    const result: CompilationResult = compile(code);

    setState((prev) => ({
      ...prev,
      Component: result.Component,
      error: result.error,
      isCompiling: false,
    }));
  }, []);

  // Update code and trigger compilation
  const setCode = useCallback((newCode: string) => {
    setState((prev) => ({ ...prev, code: newCode }));
  }, []);

  // Auto-compile when component mounts with initial code
  useEffect(() => {
    if (initialCode) {
      compileCode(initialCode);
    }
  }, []);

  return {
    ...state,
    setCode,
    compileCode,
  };
}
