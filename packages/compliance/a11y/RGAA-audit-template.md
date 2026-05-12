# RGAA 4.1.2 Audit Report — {{PRODUCT_NAME}}

**Audit date:** {{DD.MM.YYYY}}
**Standard:** RGAA 4.1.2 (maps to WCAG 2.1 AA / EN 301 549)
**URL:** {{https://example.com}}
**Test environment:** {{OS — Browser + Screen reader}}
**Method:** Manual testing using browser developer tools to inspect the DOM and accessibility tree, as well as other tools: Axe DevTools, NVDA, Colour Contrast Analyser
**Reference:** https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
**Auditor:** {{Name (internal/external)}}
**Overall result:** {{XX}}% — {{Non-Conformant / Partially Conformant / Conformant}}
**Post-fix update:** {{DD.MM.YYYY}}

> {{Summary of remediation history: initial score, PRs that moved criteria from NC to C, current score. Remove this blockquote if the audit is first-pass.}}

---

## Page Sample

The audit covered {{N}} pages, representative of all content types and functionality on the site.

| #   | Page name       | URL                    |
| --- | --------------- | ---------------------- |
| 1   | {{Page name}}   | {{https://...}}        |
| 2   | {{Page name}}   | {{https://...}}        |
| 3   | {{Page name}}   | {{https://...}}        |

---

## Compliance Summary

| #   | Theme                       | C     | NC    | NA    | Rate    |
| --- | --------------------------- | ----- | ----- | ----- | ------- |
| 1   | Images                      |       |       |       |         |
| 2   | Frames                      |       |       |       |         |
| 3   | Colors                      |       |       |       |         |
| 4   | Multimedia                  |       |       |       |         |
| 5   | Tables                      |       |       |       |         |
| 6   | Links                       |       |       |       |         |
| 7   | Scripts                     |       |       |       |         |
| 8   | Mandatory Elements          |       |       |       |         |
| 9   | Information Structure       |       |       |       |         |
| 10  | Presentation of Information |       |       |       |         |
| 11  | Forms                       |       |       |       |         |
| 12  | Navigation                  |       |       |       |         |
| 13  | Content Access              |       |       |       |         |
|     | **TOTAL**                   | **0** | **0** | **0** | **0%**  |

Legend: **C** = Conformant, **NC** = Non-Conformant, **NA** = Not Applicable.

---

## Theme 1: Images (1.1–1.9)

| #   | Criterion                                                       | Status | Observations / Evidence |
| --- | --------------------------------------------------------------- | ------ | ----------------------- |
| 1.1 | Does each image conveying information have an alternative text? |        |                         |
| 1.2 | Is each decorative image ignored by assistive technologies?     |        |                         |
| 1.3 | Is the alternative text of each informational image relevant?   |        |                         |
| 1.4 | Does each CAPTCHA image have an accessible alternative?         |        |                         |
| 1.5 | Does each CAPTCHA have an alternative access method?            |        |                         |
| 1.6 | Does each complex image have a detailed description?            |        |                         |
| 1.7 | Is each detailed description relevant?                          |        |                         |
| 1.8 | Are text images replaced with styled text wherever possible?    |        |                         |
| 1.9 | Is each image caption correctly associated with the image?      |        |                         |

**Theme 1 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Theme 2: Frames (2.1–2.2)

| #   | Criterion                            | Status | Observations / Evidence |
| --- | ------------------------------------ | ------ | ----------------------- |
| 2.1 | Does each frame have a title?        |        |                         |
| 2.2 | Is the title of each frame relevant? |        |                         |

**Theme 2 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Theme 3: Colors (3.1–3.3)

| #   | Criterion                                                                   | Status | Observations / Evidence |
| --- | --------------------------------------------------------------------------- | ------ | ----------------------- |
| 3.1 | Is information conveyed by color also available through another means?      |        |                         |
| 3.2 | Is the contrast between text color and background color sufficient?         |        |                         |
| 3.3 | Is the contrast between non-text components and adjacent colors sufficient? |        |                         |

**Theme 3 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Theme 4: Multimedia (4.1–4.13)

| #    | Criterion                                 | Status | Evidence |
| ---- | ----------------------------------------- | ------ | -------- |
| 4.1  | Audio/video has transcript                |        |          |
| 4.2  | Video has captions                        |        |          |
| 4.3  | Video-only has transcript                 |        |          |
| 4.4  | Audio description available               |        |          |
| 4.5  | Audio description present                 |        |          |
| 4.6  | Audio description pertinent               |        |          |
| 4.7  | Media player keyboard accessible          |        |          |
| 4.8  | Media player has captions toggle          |        |          |
| 4.9  | Media player has audio description toggle |        |          |
| 4.10 | Media player has fullscreen               |        |          |
| 4.11 | Media player has all controls             |        |          |
| 4.12 | Media player controls labeled             |        |          |
| 4.13 | No auto-play or can be stopped            |        |          |

**Theme 4 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Theme 5: Tables (5.1–5.8)

| #   | Criterion                              | Status | Evidence |
| --- | -------------------------------------- | ------ | -------- |
| 5.1 | Data tables have headers               |        |          |
| 5.2 | Header associations (scope/headers)    |        |          |
| 5.3 | Table has caption                      |        |          |
| 5.4 | Table title associated                 |        |          |
| 5.5 | Table title is pertinent               |        |          |
| 5.6 | Layout tables free of semantic markup  |        |          |
| 5.7 | Layout tables linearize correctly      |        |          |
| 5.8 | Layout tables have role="presentation" |        |          |

**Theme 5 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Theme 6: Links (6.1–6.2)

| #   | Criterion                                                           | Status | Observations / Evidence |
| --- | ------------------------------------------------------------------- | ------ | ----------------------- |
| 6.1 | Is the purpose of each link clear?                                  |        |                         |
| 6.2 | Are identical links with the same destination consistently labeled? |        |                         |

**Theme 6 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Theme 7: Scripts (7.1–7.5)

| #   | Criterion                     | Status | Evidence |
| --- | ----------------------------- | ------ | -------- |
| 7.1 | Scripts compatible with AT    |        |          |
| 7.2 | Keyboard access for scripts   |        |          |
| 7.3 | No keyboard traps             |        |          |
| 7.4 | No unexpected context changes |        |          |
| 7.5 | Status messages announced     |        |          |

**Theme 7 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Theme 8: Mandatory Elements (8.1–8.10)

| #    | Criterion                                                     | Status | Observations / Evidence |
| ---- | ------------------------------------------------------------- | ------ | ----------------------- |
| 8.1  | Does each web page have a valid DOCTYPE?                      |        |                         |
| 8.2  | Does each web page have a language attribute?                 |        |                         |
| 8.3  | Is the language attribute pertinent?                          |        |                         |
| 8.4  | Are language changes within page content marked up?           |        |                         |
| 8.5  | Is the language attribute for each language change pertinent? |        |                         |
| 8.6  | Does each web page have a relevant page title?                |        |                         |
| 8.7  | Does each web page have no duplicate IDs?                     |        |                         |
| 8.8  | Is each HTML tag used according to its specification?         |        |                         |
| 8.9  | Are HTML tags not used solely for presentational purposes?    |        |                         |
| 8.10 | Is the source code direction relevant?                        |        |                         |

**Theme 8 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Theme 9: Information Structure (9.1–9.4)

| #   | Criterion                    | Status | Evidence |
| --- | ---------------------------- | ------ | -------- |
| 9.1 | Heading hierarchy            |        |          |
| 9.2 | Lists use proper markup      |        |          |
| 9.3 | Landmarks pertinent          |        |          |
| 9.4 | Quotes use semantic elements |        |          |

**Theme 9 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Theme 10: Presentation of Information (10.1–10.14)

| #     | Criterion                                 | Status | Evidence |
| ----- | ----------------------------------------- | ------ | -------- |
| 10.1  | CSS-only presentation                     |        |          |
| 10.2  | Content visible without CSS               |        |          |
| 10.3  | Focus visible                             |        |          |
| 10.4  | Focus not obscured                        |        |          |
| 10.5  | Text spacing adjustable                   |        |          |
| 10.6  | No content loss with spacing              |        |          |
| 10.7  | Reflow at 320px                           |        |          |
| 10.8  | Text resize to 200%                       |        |          |
| 10.9  | Info not by shape alone                   |        |          |
| 10.10 | Info not by color alone (presentation)    |        |          |
| 10.11 | No forced two-dimensional scroll          |        |          |
| 10.12 | Custom cursor doesn't prevent reading     |        |          |
| 10.13 | Animations respect prefers-reduced-motion |        |          |
| 10.14 | Content on hover/focus dismissible        |        |          |

**Theme 10 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Theme 11: Forms (11.1–11.13)

| #     | Criterion                            | Status | Evidence |
| ----- | ------------------------------------ | ------ | -------- |
| 11.1  | Form fields have labels              |        |          |
| 11.2  | Labels pertinent                     |        |          |
| 11.3  | Labels consistent                    |        |          |
| 11.4  | Field grouping with fieldset/legend  |        |          |
| 11.5  | Fieldset legend pertinent            |        |          |
| 11.6  | Required fields indicated            |        |          |
| 11.7  | Required indication pertinent        |        |          |
| 11.8  | Required indicated before form       |        |          |
| 11.9  | Input purpose (autocomplete)         |        |          |
| 11.10 | Error messages identify field        |        |          |
| 11.11 | Error suggestions provided           |        |          |
| 11.12 | Review before legal/financial submit |        |          |
| 11.13 | Accessible help                      |        |          |

**Theme 11 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Theme 12: Navigation (12.1–12.11)

| #     | Criterion                                                                     | Status | Observations / Evidence |
| ----- | ----------------------------------------------------------------------------- | ------ | ----------------------- |
| 12.1  | Is a skiplink present on each page?                                           |        |                         |
| 12.2  | Is there more than one way to find a page within the site?                   |        |                         |
| 12.3  | Is the navigation consistent across pages?                                    |        |                         |
| 12.4  | Is active page indicated?                                                     |        |                         |
| 12.5  | Are multiple navigation sets identifiable?                                    |        |                         |
| 12.6  | Are skip links and navigation links visible when they receive keyboard focus? |        |                         |
| 12.7  | Do skip links work on all pages?                                              |        |                         |
| 12.8  | Is the tab order consistent with the logical reading order of the page?       |        |                         |
| 12.9  | Is navigation fully operable by keyboard?                                     |        |                         |
| 12.10 | Is single-character keyboard shortcuts manageable?                            |        |                         |
| 12.11 | Is content accessible in both portrait and landscape orientation?             |        |                         |

**Theme 12 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Theme 13: Content Access (13.1–13.12)

| #     | Criterion                                                                             | Status | Observations / Evidence |
| ----- | ------------------------------------------------------------------------------------- | ------ | ----------------------- |
| 13.1  | Does the user have control over any session time limits?                              |        |                         |
| 13.2  | Does the user have control over any time-based page refresh?                          |        |                         |
| 13.3  | Are links that open in a new window or tab indicated?                                 |        |                         |
| 13.4  | Are the format and size of downloadable documents indicated?                          |        |                         |
| 13.5  | Are downloadable documents accessible or is an accessible alternative provided?       |        |                         |
| 13.6  | Does cryptic content (ASCII art, emoticons, cryptic syntax) have text alternative?    |        |                         |
| 13.7  | Is content available without reliance on CSS-only content property?                   |        |                         |
| 13.8  | Can moving or blinking content be paused, stopped or hidden?                          |        |                         |
| 13.9  | Is the content viewable regardless of the screen orientation (portrait or landscape)? |        |                         |
| 13.10 | Is there an alternative to complex gestures (pinch, swipe, drag)?                     |        |                         |
| 13.11 | Does the page avoid automatic audio playback?                                         |        |                         |
| 13.12 | Is there an alternative to motion activation?                                         |        |                         |

**Theme 13 result: {{C}} C, {{NC}} NC, {{NA}} NA**

---

## Priority Remediation Plan

| Priority | RGAA criterion | Recommended action |
| -------- | -------------- | ------------------ |
| Critical |                |                    |
| High     |                |                    |
| Medium   |                |                    |
| Low      |                |                    |

---

## Declaration

Based on this audit{{ and subsequent fixes}}, {{PRODUCT_NAME}} achieves **{{XX}}% compliance** with RGAA v.4.1.2 criteria, qualifying as **{{Non-Conformant / Partially Conformant / Conformant}}**.

Primary gaps are with {{list primary non-conformant themes}}. The application performs well on {{list fully conformant themes}}.

_This report was prepared on the basis of RGAA v.4.1.2 criteria and tests._
_Auditor: {{Name}} ({{internal/external}}) — {{OS, Browser + Screen reader}}_
_Reference: https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/_

---

## Appendix — Standard media-player keyboard shortcuts

When auditing a video/audio player component (Themes 4, 7, 12), check against the de-facto standard shortcut set used by YouTube, Vimeo, Able Player, Video.js, OzPlayer, and native `<video controls>`:

| Key                   | Action                                          |
| --------------------- | ----------------------------------------------- |
| `Space` / `K`         | Play-pause                                      |
| `←` / `→`             | Seek −5 s / +5 s                                |
| `Shift+←` / `Shift+→` | Fine seek (±1 s or per frame)                   |
| `PageUp` / `PageDown` | Seek ±10 s                                      |
| `Home` / `End`        | Jump to start / end                             |
| `↑` / `↓`             | Volume ±5 %                                     |
| `M`                   | Mute toggle                                     |
| `F`                   | Fullscreen toggle                               |
| `C`                   | Captions toggle                                 |
| `<` / `>`             | Playback rate down / up                         |

Slider requirements for seek and volume controls: `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext` (for human-readable time / percentage). Arrow keys on a focused slider natively adjust `aria-valuenow` by 1. Container should be focusable (`tabindex="0"`) and announce its purpose via `aria-label`.

References:

- [WAI-ARIA Authoring Practices — Slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
- [Able Player keyboard controls](https://ableplayer.github.io/ableplayer/#keyboard)
- [YouTube player keyboard shortcuts](https://support.google.com/youtube/answer/7631406)
