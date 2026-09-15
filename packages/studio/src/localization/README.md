# Studio localization

Studio UI messages live in this directory. The English catalog in
`messages/en.ts` is the source of truth for message keys. Locale catalogs are
kept in separate files so that adding a language does not create one large,
conflict-prone file.

## Adding a message

1. Add a stable, semantic key to `messages/en.ts`.
2. Add the same key to every supported locale catalog.
3. Keep placeholders unchanged. For example, `{current}` must remain
   `{current}` in every translation.
4. Render the message with `useStudioLocale().t()` in React components or
   `createTranslator()` in non-React code.
5. Run `bun test packages/studio/src/test/localization.test.ts` and the Studio
   formatting check before opening a pull request.

Message keys are not English sentences. Once a key is released, keep it stable
so that locale files can evolve without changing component code.

Missing or invalid translations fall back to English at runtime. The tests
still report missing keys, empty strings, unknown keys, and placeholder
mismatches so that fallback is a safety net rather than a translation workflow.

## Adding a locale

Add the locale code to `SUPPORTED_LOCALES`, create a new file under
`messages/`, and add it to `messages/index.ts`. The catalog must satisfy
`Record<keyof typeof en, string>`. Add coverage for the locale to the
localization test before requesting review.

This layer translates the Studio operation UI only. It must not translate
composition IDs, user-created names, filenames, source code, video content,
subtitles, or transcription language settings.
