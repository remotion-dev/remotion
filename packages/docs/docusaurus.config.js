/**
 *
 * @param {"complete" | "new-doc"} mode
 * @returns
 */
const config = (mode) => ({
  title: "Remotion | Make videos programmatically in React",
  tagline: "Make videos programmatically",
  url:
    process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production"
      ? `https://${process.env.VERCEL_URL}`
      : "https://www.remotion.dev",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.png",
  organizationName: "remotion-dev", // Usually your GitHub org/user name.
  projectName: "remotion", // Usually your repo name.
  webpack: {
    jsLoader: (isServer) => ({
      loader: require.resolve("swc-loader"),
      options: {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          target: "es2017",
        },
        module: {
          type: isServer ? "commonjs" : "es6",
        },
      },
    }),
  },
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
          type: mode === "complete" ? "docSidebar" : "doc",
          docId: mode === "complete" ? undefined : "new-doc",
          sidebarId: mode === "complete" ? "mainSidebar" : undefined,
        },
        mode === "complete"
          ? {
              to: "/docs/api",
              label: "API",
              position: "left",
              type: "docSidebar",
              sidebarId: "apiSidebar",
            }
          : null,
        {
          to: "https://www.remotion.pro/license",
          label: "Pricing",
          position: "left",
        },
        {
          type: "dropdown",
          label: "More",
          position: "left",
          items: [
            {
              to: "/docs/resources",
              label: "Resources",
            },
            { to: "blog", label: "Blog" },
            { to: "showcase", label: "Showcase" },
            { to: "experts", label: "Experts" },
            { to: "learn", label: "Learn" },
            { to: "about", label: "About" },
            { to: "success-stories", label: "Success Stories" },
            { to: "https://remotion.pro/store", label: "Store" },
            { to: "/docs/support", label: "Support" },
          ],
        },
        {
          to: "https://github.com/remotion-dev/remotion",
          label: "GitHub",
          position: "right",
        },
        {
          to: "https://remotion.dev/discord",
          label: "Discord",
          position: "right",
        },
        {
          to: "https://x.com/remotion",
          label: "X",
          position: "right",
        },
      ].filter(Boolean),
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
              label: "Learn",
              to: "/learn",
            },
            {
              label: "Store",
              href: "https://remotion.pro/store",
            },
            {
              label: "Changelog",
              href: "https://remotion.dev/changelog",
            },
            {
              label: "GitHub",
              href: "https://github.com/remotion-dev/remotion",
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
            },
            {
              label: "X",
              href: "https://x.com/remotion",
            },
            {
              label: "YouTube",
              href: "https://youtube.com/@remotion_dev",
            },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/company/remotion-dev/",
            },
            {
              label: "Instagram",
              href: "https://instagram.com/remotion",
            },
            {
              label: "TikTok",
              href: "https://www.tiktok.com/@remotion",
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
            mode === "complete"
              ? {
                  label: "Blog",
                  to: "blog",
                }
              : null,
            {
              label: "Success Stories",
              to: "success-stories",
            },
            {
              label: "Support",
              to: "/docs/support",
            },
            {
              label: "License",
              href: "https://remotion.dev/license",
            },
            {
              label: "Remotion Pro",
              href: "https://remotion.pro",
            },
            {
              label: "Brand",
              href: "https://remotion.dev/brand",
            },
          ].filter(Boolean),
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
          path: mode === "complete" ? "docs" : "new-docs",
          sidebarPath:
            mode === "complete" ? require.resolve("./sidebars.js") : undefined,
          editUrl:
            "https://github.com/remotion-dev/remotion/edit/main/packages/docs/",
        },
        blog: {
          path:
            mode === "complete" ? undefined : "intentionally-not-existing-path",
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
      "./shiki",
      {
        vfsRoot: process.cwd(),
        themes: ["github-light", "github-dark"],
        defaultCompilerOptions: {
          types: ["node"],
        },
      },
    ],
  ],
  plugins:
    mode === "complete"
      ? [
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
          [
            "@docusaurus/plugin-content-blog",
            {
              /**
               * Required for any multi-instance plugin
               */
              id: "learn",
              /**
               * URL route for the blog section of your site.
               * *DO NOT* include a trailing slash.
               */
              routeBasePath: "learn",
              /**
               * Path to data on filesystem relative to site dir.
               */
              path: "./learn",
              blogSidebarTitle: "Learn",
            },
          ],
          "./route-plugin",
        ]
      : [],
});

module.exports = config("complete");
module.exports.customFields = { config };
