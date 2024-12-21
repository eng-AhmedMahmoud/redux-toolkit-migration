import { Paths } from "@/lib/pageroutes";

export const Documents: Paths[] = [
  {
    title: "Introduction",
    href: "/introduction",
    heading: "Getting started",
    items: [
      {
        title: "Base Knowledge",
        href: "/base-knowledge",
      },
      {
        title: "Steps of Migration",
        href: "/migration-steps",
      },
      {
        title: "Structure Overview",
        href: "/structure-overview",
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: "Hands on VVL",
    href: "/hands-on-vvl",
    heading: "Implementation",
    items: [
      {
        title: "API Migration",
        href: "/api-migration",
        items: [
          {
            title: "Forming the API",
            href: "/forming-the-api",
          },
          {
            title: "Using the API",
            href: "/using-the-api",
          },
        ],
      },
      {
        title: "Saga to Listeners",
        href: "/saga-to-listeners",
      },
      {
        title: "Updating the Selectors",
        href: "/updating-selectors",
      },
      {
        title: "Components Separation",
        href: "/components-separation",
        items: [
          {
            title: "Standalone Component",
            href: "/standalone-component",
          },
          {
            title: "Shared Components",
            href: "/shared-components",
          },
        ],
      },
      {
        title: "Code Reviewing & Testing",
        href: "/code-testing",
      },
    ],
  },
];

