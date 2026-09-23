// @remotion/google-fonts fetches the actual font files from fonts.gstatic.com
// at render/preview time (it only bundles the @font-face CSS, not the woff2
// files) — see the remotion-markup google-fonts.md guide. Tested for real:
// even though fonts.gstatic.com answers a plain `curl` from this sandbox,
// the SAME host fails inside the actual rendering Chromium with
// net::ERR_CERT_AUTHORITY_INVALID (curl and the renderer's browser process
// evidently go through different network paths here) -- calling loadFont()
// at module scope crashed every render that uses `poppins` with an uncaught
// "Failed to fetch" from deep inside @remotion/google-fonts' own fetch
// (confirmed by an actual render, not assumed). This exports a system font
// stack instead, which renders identically everywhere. Swap it for
// `import {loadFont} from "@remotion/google-fonts/Poppins"; export const
// {fontFamily: poppins} = loadFont();` when rendering somewhere with
// unrestricted network access to fonts.gstatic.com from the browser itself.
// See RoundedTextBoxScene for a real, working @remotion/google-fonts call
// (getAvailableFonts(), a pure catalog list -- no network needed) and
// docs/findings.md for the full story.
export const poppins =
  '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';
