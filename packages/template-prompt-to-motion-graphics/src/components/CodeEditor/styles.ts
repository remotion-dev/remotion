export const EDITOR_STYLES = `
  /* Override Monaco's vs-dark background to be darker than header */
  .monaco-editor,
  .monaco-editor .overflow-guard,
  .monaco-editor-background,
  .monaco-editor .inputarea.ime-input,
  .monaco-editor .margin {
    background-color: #1e1e1e !important;
  }
  .readonly-line {
    background-color: rgba(80, 80, 80, 0.2) !important;
  }
  .readonly-glyph {
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
    margin-left: 5px;
  }
  /* JSX syntax highlighting classes */
  .jsx-tag-angle-bracket { color: #808080; }
  .jsx-tag-name { color: #4ec9b0; }
  .jsx-tag-attribute-key { color: #9cdcfe; }
  .jsx-expression-braces { color: #ffd700; }
  .jsx-text { color: #ce9178; }
  .jsx-tag-order-1 { }
  .jsx-tag-order-2 { }
  .jsx-tag-order-3 { }
  /* Toast animation */
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
`;
