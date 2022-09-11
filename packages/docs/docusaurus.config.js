module.exports = {
  title: "Remotion",
  tagline: "Create motion graphics in React",
  url: "https://remotion.dev",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/logo-small.png",
  organizationName: "remotion-dev", // Usually your GitHub org/user name.
  projectName: "remotion", // Usually your repo name.
  themeConfig: {
    algolia: {
      appId: "PLSDUOL1CA",
      apiKey: "3e42dbd4f895fe93ff5cf40d860c4a85",
      indexName: "remotion",
      contextualSearch: false,
    },
    image: "img/social-preview.png",
    navbar: {
      title: "Remotion",
      logo: {
        alt: "Remotion logo",
        src: "img/logo-small.png",
      },
      items: [
        {
          to: "/docs",
          label: "Docs",
          position: "left",
          type: "docSidebar",
          sidebarId: "mainSidebar",

        },
        {
          to: "/docs/api",
          label: "API",
          position: "left",
          type: "docSidebar",
          sidebarId: "apiSidebar",
        },
        { to: "blog", label: "Blog", position: "left" },
        { to: "showcase", label: "Showcase", position: "left" },
        { to: "/docs/license", label: "Licensing", position: "left" },
        {
          href: "https://twitter.com/remotion_dev",
          label: "Twitter",
          position: "right",
          "data-splitbee-event": "External Link",
          "data-splitbee-event-target": "Twitter",
        },
        {
          href: "https://remotion.dev/discord",
          label: "Discord",
          position: "right",
          "data-splitbee-event": "External Link",
          "data-splitbee-event-target": "Discord",
        },
        {
          href: "https://github.com/remotion-dev/remotion",
          label: "GitHub",
          position: "right",
          "data-splitbee-event": "External Link",
          "data-splitbee-event-target": "Github",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Remotion",
          items: [
            {
              label: "Getting started",
              to: "/docs/",
            },
            {
              label: "API Reference",
              to: "/docs/cli",
            },
            {
              label: "Player",
              to: "/player",
            },
            {
              label: "Lambda",
              to: "/lambda",
            },
            {
              label: "Changelog",
              href: "https://github.com/remotion-dev/remotion/releases",
            },
            {
              label: "GitHub Issues",
              href: "https://github.com/remotion-dev/remotion/issues",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "Github",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Showcase",
              to: "showcase",
            },
            {
              label: "Experts",
              to: "experts",
            },

            {
              label: "Discord",
              href: "https://remotion.dev/discord",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "Discord",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/remotion_dev",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "Twitter",
            },
            {
              label: "Instagram",
              href: "https://instagram.com/remotion.dev",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "Instagram",
            },
            {
              label: "TikTok",
              href: "https://www.tiktok.com/@remotion.dev",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "TikTok",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "About us",
              to: "about",
            },
            {
              label: "Blog",
              to: "blog",
            },
            {
              label: "Success Stories",
              to: "success-stories",
            },
            {
              label: "GitHub",
              href: "https://github.com/remotion-dev/remotion",
            },
            {
              label: "For companies",
              href: "https://companies.remotion.dev",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} remotion.dev. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/remotion-dev/remotion/edit/main/packages/docs/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/remotion-dev/remotion/edit/main/packages/docs/blog/",
        },
        theme: {
          customCss: [require.resolve("./src/css/custom.css")],
        },
      },
    ],
    [
      "@jonny/docusaurus-preset-shiki-twoslash",
      {
        vfsRoot: process.cwd(),
        themes: ["github-light", "github-dark"],
        defaultCompilerOptions: {
          types: ["node"],
        },
      },
    ],
  ],
  plugins: [
    [
      "@docusaurus/plugin-content-blog",
      {
        /**
         * Required for any multi-instance plugin
         */
        id: "success-stories",
        /**
         * URL route for the blog section of your site.
         * *DO NOT* include a trailing slash.
         */
        routeBasePath: "success-stories",
        /**
         * Path to data on filesystem relative to site dir.
         */
        path: "./success-stories",
        blogSidebarTitle: "Success stories",
      },
    ],
  ],
};
