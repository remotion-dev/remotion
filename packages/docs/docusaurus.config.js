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
              label: "Twitter",
              href: "https://twitter.com/JNYBGR",
              "data-splitbee-event": "External Link",
              "data-splitbee-event-target": "Twitter",
            },
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
