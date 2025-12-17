export const EDITOR_STYLES = `
  /* Override Monaco's vs-dark background to be darker than header */
  .monaco-editor,
  .monaco-editor .overflow-guard,
  .monaco-editor-background,
  .monaco-editor .inputarea.ime-input,
  .monaco-editor .margin {
    background-color: #1e1e1e !important;
  }
  /* JSX syntax highlighting classes */
  .jsx-tag-angle-bracket { color: #808080; }
  .jsx-tag-name { color: #4ec9b0; }
  .jsx-tag-attribute-key { color: #9cdcfe; }
  .jsx-expression-braces { color: #ffd700; }
  .jsx-text { color: #ce9178; }
`;
