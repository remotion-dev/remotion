"use client";

import { useCallback } from "react";
import {
  compileCode,
  type CompilationResult,
} from "../remotion/compiler";

export type { CompilationResult };

export function useCodeCompiler() {
  const compile = useCallback(
    (code: string): CompilationResult => compileCode(code),
    [],
  );

  return { compile };
}
