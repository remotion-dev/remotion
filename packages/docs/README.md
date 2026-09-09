# @remotion/docs

## Usage

This is an internal package.

## Elements search indexing

The public Algolia `remotion` index is configured in `docusaurus.config.ts`, but the hosted crawler's extraction configuration is not maintained in this repository.

Gallery cards must not generate content records: their element names and descriptions inherit the gallery's hierarchy title instead of the individual element's title ([#10978](https://github.com/remotion-dev/remotion/issues/10978)). `ElementGrid` marks only the card lists with `data-algolia-exclude="element-cards"`. Gallery headings and introductory text remain indexable; individual element pages are unchanged. Links remain in the served HTML for visitors and crawler discovery.

### Required external rollout (approval needed)

The attribute is a local contract, not a built-in Algolia exclusion feature. Deploying the markup alone does not fix the index. An authorized crawler maintainer must:

1. Inspect every hosted crawler action that indexes Elements pages into `remotion`. Add `$` to its `recordExtractor` arguments if needed, and run the following before `helpers.docsearch(...)` (or any other content extraction), preserving the existing selectors and options:

   ```js
   $('[data-algolia-exclude="element-cards"]').remove();
   ```

   This uses Algolia's documented [Cheerio DOM removal mechanism](https://docsearch.algolia.com/docs/record-extractor/#manipulate-the-dom-with-cheerio). Excluding only the description `p`, or using `:not(...)` on that node, is insufficient: an ancestor `li` can still supply the entire card text.

2. After deploying the markup, test extraction for `/elements/`, `/elements/data/`, and `/elements/data/line-chart/`. Gallery headings should remain, but no card names/descriptions should produce gallery content records. The individual page must still produce a `Line Chart` heading record and its normal content. Check that individual pages are still discovered via the sitemap/links.
3. Run a full crawl/reindex that replaces stale records, including both slash variants; a single-page crawl may leave old duplicate records behind.
4. Query the live index for `line chart` and other element names. Confirm that the individual page has the correct title and gallery card content hits are gone.

The rendered-markup test exercises the removal contract with Bun's HTMLRewriter, not the remote DocSearch helper. Hosted extraction and post-recrawl search verification are required to finish rollout. No remote crawler settings are changed by this repository change.

### Trailing-slash duplicates

Investigation confirmed that `/elements` and `/elements/` both return HTTP 200 and both declare `https://www.remotion.dev/elements/` as canonical. The live index nevertheless contains both URL variants for the same gallery card. The site already supplies the canonical URL; no global `trailingSlash` or routing change is needed for this fix.

In the hosted crawler, inspect canonical handling (including `ignoreCanonicalTo`), overlapping actions/start URLs, and stale records before changing normalization. Use the existing slash canonical for the Elements overview and verify that the rebuilt index contains only one variant. The duplicate's exact origin cannot be determined from the public search-only API.
