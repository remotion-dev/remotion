## Updating Google Font List

1. Grab JSON from https://developers.google.com/fonts/docs/developer_api (choose capability WOFF2) and paste the `items` array it into `scripts/google-fonts.json`
2. Empty `typesVersions` field in `package.json`
3. Run `pnpm build`
