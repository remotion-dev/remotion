// Side-effect module: must be imported before any module that calls
// `wrapInSchema` at load time (e.g. Sequence.tsx), so the wrapper actually
// installs the visual-mode code path.
process.env.EXPERIMENTAL_VISUAL_MODE_ENABLED = '1';
