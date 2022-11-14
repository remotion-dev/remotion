const path = require("path");
const fs = require("fs");

module.exports = function () {
  return {
    name: "slug-plugin",
    loadContent() {
      const experts = fs.readFileSync(
        path.join(__dirname, "../src/data/experts.tsx"),
        "utf-8"
      );
      const slugs = experts
        .split("\n")
        .map((a) => {
          return a.match(/slug:\s"(.*)"/)?.[1];
        })
        .filter(Boolean);
      return slugs;
    },
    contentLoaded({ content, actions }) {
      content.forEach((c) => {
        actions.addRoute({
          path: "/experts/" + c,
          component: "@site/src/components/ExpertPage.tsx",
          modules: {},
          exact: true,
        });
      });
    },
  };
};
