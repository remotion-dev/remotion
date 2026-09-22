// @remotion/google-fonts fetches the actual font files from fonts.gstatic.com
// at render/preview time (it only bundles the @font-face CSS, not the woff2
// files) — see the remotion-markup google-fonts.md guide. That network
// access isn't available in every environment (for example a sandboxed
// Claude session), so this exports a system font stack instead, which
// renders identically everywhere. Swap it for
// `import {loadFont} from "@remotion/google-fonts/Poppins"; export const
// {fontFamily: poppins} = loadFont();` when rendering somewhere with
// unrestricted network access.
export const poppins =
  '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';
