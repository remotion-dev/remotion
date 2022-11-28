module.exports = {
  title: "Remotion | Make videos programmatically in React",
  tagline: "Make videos programmatically",
  url: "https://www.remotion.dev",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.png",
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
      logo: {
        alt: "Remotion Logo",
        src: "img/new-logo.png",
        srcDark: "img/remotion-white.png",
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
        { to: "/docs/license", label: "Pricing", position: "left" },
        {
          type: "dropdown",
          label: "More",
          position: "left",
          items: [
            { to: "blog", label: "Blog" },
            { to: "showcase", label: "Showcase" },
            { to: "experts", label: "Experts" },
            { to: "about", label: "About" },
            { to: "success-stories", label: "Success Stories" },
            { to: "/docs/support", label: "Support" },
          ],
        },
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
              to: "/docs/api",
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
              label: "GitHub",
              href: "https://github.com/remotion-dev/remotion",
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
              label: "Support",
              to: "/docs/support",
            },
            {
              label: "For companies",
              href: "https://companies.remotion.dev",
            },
            {
              label: "Brand",
              href: "https://remotion.dev/brand",
            },
          ],
        },
      ],
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
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
    "./route-plugin",
  ],
};
