export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Lightweight validation to check if GPT response contains JSX content.
 * This is a fallback check after the LLM pre-validation.
 */
export function validateGptResponse(response: string): ValidationResult {
  const trimmed = response.trim();

  // Check for JSX-like content (at least one opening tag)
  // Matches: <ComponentName, <div, <span, etc.
  const hasJsx = /<[A-Z][a-zA-Z]*|<[a-z]+[^>]*>/.test(trimmed);
  if (!hasJsx) {
    return {
      isValid: false,
      error:
        "The response was not a valid motion graphics component. Please try a different prompt.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Extract only the component code, removing any trailing text/commentary.
 * Uses brace counting to find the end of the component.
 */
export function extractComponentCode(code: string): string {
  // Find the component declaration start
  const exportMatch = code.match(
    /export\s+const\s+\w+\s*=\s*\(\s*\)\s*=>\s*\{/,
  );

  if (exportMatch && exportMatch.index !== undefined) {
    const declarationStart = exportMatch.index;
    const bodyStart = declarationStart + exportMatch[0].length;

    // Count braces to find the matching closing brace
    let braceCount = 1;
    let endIndex = bodyStart;

    for (let i = bodyStart; i < code.length; i++) {
      const char = code[i];
      if (char === "{") {
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (braceCount === 0) {
      // Return everything from start of code to end of component (including closing brace and semicolon)
      let result = code.slice(0, endIndex + 1);
      // Add semicolon if not present
      if (!result.trim().endsWith(";")) {
        result = result.trimEnd() + ";";
      }
      return result.trim();
    }
  }

  // Fallback: return as-is
  return code;
}
