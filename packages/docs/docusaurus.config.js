module.exports = {
  title: "Remotion",
  tagline: "Create motion graphics in React",
  url: "https://remotion.dev",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/logo-small.png",
  organizationName: "JonnyBurger", // Usually your GitHub org/user name.
  projectName: "remotion", // Usually your repo name.
  themeConfig: {
    algolia: {
      apiKey: "f63f08c037745da5269569bfbd91cd59",
      indexName: "remotion",
      contextualSearch: false,
    },
    image: "img/social-preview.png",
    prism: {
      theme: require("prism-react-renderer/themes/github"),
      darkTheme: require("prism-react-renderer/themes/dracula"),
    },
    navbar: {
      title: "Remotion",
      logo: {
        alt: "Remotion logo",
        src: "img/logo-small.png",
      },
      items: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Docs",
          position: "left",
        },
        { to: "blog", label: "Blog", position: "left" },
        { to: "/docs/license", label: "Licensing", position: "left" },
        {
          href: "https://discord.gg/6VzzNDwUwV",
          label: "Discord",
          position: "right",
          "data-splitbee-event": "External Link",
          "data-splitbee-event-target": "Discord",
        },
        {
          href: "https://github.com/JonnyBurger/remotion",
          label: "GitHub",
          position: "right",
          "data-splitbee-event": "External Link",
          "data-splitbee-event-target": "Github",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting started",
              to: "docs/",
            },
            {
              label: "API reference",
              to: "docs/cli",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub Issues",
              href: "https://github.com/JonnyBurger/remotion/issues",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "Github",
            },
            {
              label: "Discord",
              href: "https://discord.gg/6VzzNDwUwV",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "Discord",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/JNYBGR",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "Twitter",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/JonnyBurger/remotion",
            },
            {
              label: "For companies",
              href: "https://companies.remotion.dev",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Jonny Burger. Built with Docusaurus.`,
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
            "https://github.com/JonnyBurger/remotion/edit/main/packages/docs/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/Jonnyburger/remotion/edit/main/packages/docs/blog/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
