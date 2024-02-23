// Based on https://github.com/facebook/docusaurus/blob/ed9d2a26f5a7b8096804ae1b3a4fffc504f8f90d/packages/docusaurus-theme-classic/src/theme/CodeBlock/index.tsx
// which is under MIT License as per the banner

import "./styles.css";

import Translate, { translate } from "@docusaurus/Translate";
import copy from "copy-text-to-clipboard";
import React, { useRef, useState } from "react";

const CodeBlock = ({ children, ...props }) => {
  const pre = useRef(null);
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyCode = () => {
    if (pre.current) {
      const elementToSelect = pre.current.querySelector("code div.line")?.length
        ? "code div.line"
        : "div div.line";

      copy(
        Array.from(pre.current.querySelectorAll(elementToSelect))
          .map((el) => el.textContent)
          .join("\n"),
      );
    }

    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <pre {...props} ref={pre}>
      {children}
      <button
        type="button"
        aria-label={translate({
          id: "theme.CodeBlock.copyButtonAriaLabel",
          message: "Copy code to clipboard",
          description: "The ARIA label for copy code blocks button",
        })}
        className="copy-button"
        onClick={handleCopyCode}
      >
        {showCopied ? (
          <Translate
            id="theme.CodeBlock.copied"
            description="The copied button label on code blocks"
          >
            Copied
          </Translate>
        ) : (
          <Translate
            id="theme.CodeBlock.copy"
            description="The copy button label on code blocks"
          >
            Copy
          </Translate>
        )}
      </button>
    </pre>
  );
};

export default CodeBlock;
