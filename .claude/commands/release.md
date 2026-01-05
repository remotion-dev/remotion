1. Run `bun i`
2. Run `bun run build`
3. Check `https://www.npmjs.com/package/remotion` to get the current version number
4. Run `bun set-version.ts <version>`, where <version> is the current version plus 1
5. Run `NPM_CONFIG_TOKEN=<token> bun run release` where <token> is $1
