## Updating Google Font List

1. Grab JSON from https://developers.google.com/fonts/docs/developer_api and paste the `items` array it into `scripts/google-fonts.json`
2. Empty `typesVersions` and `exports` fields in `package.json`
3. Run `pnpm build`
