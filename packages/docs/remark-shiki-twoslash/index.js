const { TwoslashError } = require("@typescript/twoslash");

const { lex, parse } = require("fenceparser");
const { getHighlighter } = require("shiki");
const { renderCodeToHTML } = require("shiki-twoslash");
const visit = require("unist-util-visit");

const { cachedTwoslashCall } = require("./caching");
const { setupNodeForTwoslashException } = require("./exceptionMessageDOM");
const { addIncludes, replaceIncludesInCode } = require("./includes");

// A set of includes which can be pulled via a set ID
const includes = new Map();

function getHTML(code, fence, highlighters, twoslash, twoslashSettings) {
  // Shiki doesn't respect json5 as an input, so switch it
  // to json, which can handle comments in the syntax highlight
  const replacer = {
    json5: "json",
  };

  if (replacer[fence.lang]) fence.lang = replacer[fence.lang];

  let results;
  // Support 'twoslash' includes
  if (fence.lang === "twoslash") {
    if (!fence.meta.include || typeof fence.meta.include !== "string") {
      throw new Error(
        "A twoslash code block needs a pragma like 'twoslash include [name]'",
      );
    }

    addIncludes(includes, fence.meta.include, code);
    results = twoslashSettings.wrapFragments
      ? `<div class="shiki-twoslash-fragment"></div>`
      : "";
  } else {
    // All good, get each highlighter and render the shiki output for it
    const output = highlighters.map((highlighter) => {
      // @ts-expect-error
      const themeName = highlighter.customName
        .split("/")
        .pop()
        .replace(".json", "");
      return renderCodeToHTML(
        code,
        fence.lang,
        fence.meta,
        { themeName, ...twoslashSettings },
        // @ts-expect-error
        highlighter,
        twoslash,
      );
    });
    results = output.join("\n");
    if (highlighters.length > 1 && twoslashSettings.wrapFragments) {
      results = `<div class="shiki-twoslash-fragment">${results}</div>`;
    }
  }

  return results;
}

/**
 * Runs twoslash across an AST node, switching out the text content, and lang
 * and adding a `twoslash` property to the node.
 */
exports.runTwoSlashOnNode = (code, { lang, meta }, settings = {}) => {
  // Offer a way to do high-perf iterations, this is less useful
  // given that we cache the results of twoslash in the file-system
  const shouldDisableTwoslash =
    typeof process !== "undefined" &&
    process.env &&
    Boolean(process.env.TWOSLASH_DISABLE);
  if (shouldDisableTwoslash) return undefined;

  // Only run twoslash when the meta has the attribute twoslash
  if (meta.twoslash) {
    const importedCode = replaceIncludesInCode(includes, code);
    return cachedTwoslashCall(importedCode, lang, settings);
  }

  return undefined;
};

// To make sure we only have one highlighter per theme in a process
const highlighterCache = new Map();

/** Sets up the highlighters, and cache's for recalls */
exports.highlightersFromSettings = (settings) => {
  // console.log("i should only log once per theme")
  // ^ uncomment this to debug if required
  const themes =
    settings.themes || (settings.theme ? [settings.theme] : ["light-plus"]);

  return Promise.all(
    themes.map(async (theme) => {
      // You can put a string, a path, or the JSON theme obj
      const themeName = theme.name || theme;
      // @ts-expect-error
      const highlighter = await getHighlighter({
        ...settings,
        theme,
        themes: undefined,
      });

      // @ts-expect-error - https://github.com/shikijs/shiki/pull/162 will fix this
      highlighter.customName = themeName;
      return highlighter;
    }),
  );
};

const parsingNewFile = () => includes.clear();

const parseFence = (fence) => {
  const [lang, ...tokens] = lex(fence);

  // if the language is twoslash and include key is found
  // insert an `=` after include to make it `include=[name]`
  // which yields better meta
  if (lang === "twoslash") {
    // Search for `include` in tokens
    const index = tokens.indexOf("include");
    if (index !== -1) {
      tokens.splice(index + 1, 0, "=");
    }
  }

  const meta = parse(tokens) ?? {};

  return {
    lang: (lang || "").toString(),
    meta,
  };
};

// --- The Remark API ---

/**
 * Synchronous outer function, async inner function, which is how the remark
 * async API works.
 */
function remarkTwoslash(settings = {}) {
  if (!highlighterCache.has(settings)) {
    highlighterCache.set(settings, exports.highlightersFromSettings(settings));
  }

  const transform = async (markdownAST) => {
    const highlighters = await highlighterCache.get(settings);
    parsingNewFile();
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    visit(markdownAST, "code", exports.remarkVisitor(highlighters, settings));
  };

  return transform;
}

/**
 * The function doing the work of transforming any codeblock samples in a remark AST.
 */
exports.remarkVisitor =
  (highlighters, twoslashSettings = {}) =>
  (node) => {
    const code = node.value;
    let fence;

    try {
      fence = parseFence([node.lang, node.meta].filter(Boolean).join(" "));
    } catch (error) {
      const twoslashError = new TwoslashError(
        "Codefence error",
        "Could not parse the codefence for this code sample",
        "It's usually an unclosed string",
        code,
      );
      return setupNodeForTwoslashException(code, node, twoslashError);
    }

    // Do nothing if the node has an attribute to ignore
    if (
      Object.keys(fence.meta).filter((key) =>
        (twoslashSettings.ignoreCodeblocksWithCodefenceMeta || []).includes(
          key,
        ),
      ).length > 0
    ) {
      return;
    }

    let twoslash;
    try {
      // By allowing node.twoslash to already exist you can set it up yourself in a browser
      twoslash =
        node.twoslash ||
        exports.runTwoSlashOnNode(code, fence, twoslashSettings);
    } catch (error) {
      const shouldAlwaysRaise =
        process && process.env && Boolean(process.env.CI);
      // @ts-expect-error
      const yeahButNotInTests = typeof jest === "undefined";

      if (
        (shouldAlwaysRaise && yeahButNotInTests) ||
        twoslashSettings.alwayRaiseForTwoslashExceptions
      ) {
        throw error;
      } else {
        return setupNodeForTwoslashException(code, node, error);
      }
    }

    if (twoslash) {
      node.value = twoslash.code;
      node.lang = twoslash.extension;
      node.twoslash = twoslash;
    }

    const shikiHTML = getHTML(
      node.value,
      fence,
      highlighters,
      twoslash,
      twoslashSettings,
    );
    node.type = "html";
    node.value = shikiHTML;
    node.children = [];
  };

module.exports = remarkTwoslash;

// --- The Markdown-it API ---

/** Only the inner function exposed as a synchronous API for markdown-it */

exports.setupForFile = async (settings = {}) => {
  parsingNewFile();

  if (!highlighterCache.has(settings)) {
    highlighterCache.set(settings, exports.highlightersFromSettings(settings));
  }

  const highlighters = await highlighterCache.get(settings);
  return { settings, highlighters };
};

exports.transformAttributesToHTML = (
  code,
  fenceString,
  highlighters,
  settings,
) => {
  const fence = parseFence(fenceString);

  const twoslash = exports.runTwoSlashOnNode(code, fence, settings);
  const newCode = (twoslash && twoslash.code) || code;
  return getHTML(newCode, fence, highlighters, twoslash, settings);
};
