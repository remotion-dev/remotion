const path = require("path");

/**
 * @returns {import("@docusaurus/types").Plugin}
 */
function theme() {
  return {
    name: "docusaurus-theme-shiki-twoslash",
    getThemePath() {
      return path.resolve(__dirname, "./theme");
    },
  };
}

module.exports = theme;
