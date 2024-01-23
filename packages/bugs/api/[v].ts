// Keep in sync with packages/cli/src/editor/components/UpdateCheck.tsx
type Bug = {
  title: string;
  description: string;
  link: string;
  versions: string[];
};

const bugs: Bug[] = [
  {
    title: "Too tight dependency on zod",
    description:
      "Remotion would require zod and @remotion/zod-types even though it should be optional.",
    link: "https://remotion.dev/changelog",
    versions: ["4.0.92", "4.0.93"],
  },
  {
    title: "Broken release",
    description: "Rendering may fail. Upgrade to 4.0.94.",
    link: "https://remotion.dev/changelog",
    versions: ["4.0.90", "4.0.91"],
  },
  {
    title: "<Video> seeking breaks during rendering for some videos",
    description: "A timeout would occur on some videos.",
    link: "https://remotion.dev/changelog",
    versions: ["4.0.86", "4.0.87", "4.0.88"],
  },
  {
    title: "Lambda throws an undefined variable error",
    description: "The publish script of this version was broken.",
    link: "https://remotion.dev/changelog",
    versions: ["4.0.73"],
  },
  {
    title: "Subsequent Lambda renders become slow",
    description: "A warm Lambda function would get slower over time.",
    link: "https://github.com/remotion-dev/remotion/pull/3184",
    versions: ["4.0.66", "4.0.67", "4.0.68", "4.0.69", "4.0.70"],
  },
  {
    title: "<Player> does not render",
    description: "The <Player> component does not render anything.",
    link: "https://github.com/remotion-dev/remotion/issues/3128",
    versions: ["4.0.63"],
  },
  {
    title: "Slow rendering for long videos",
    description: "A render could get progressively slower the longer it runs.",
    link: "https://github.com/remotion-dev/remotion/pull/3106",
    versions: [
      "4.0.59",
      "4.0.58",
      "4.0.57",
      "4.0.56",
      "4.0.55",
      "4.0.54",
      "4.0.53",
      "4.0.52",
      "4.0.51",
      "4.0.50",
      "4.0.49",
      "4.0.48",
      "4.0.47",
      "4.0.46",
      "4.0.45",
      "4.0.44",
      "4.0.43",
      "4.0.42",
      "4.0.41",
      "4.0.40",
      "4.0.39",
      "4.0.38",
      "4.0.37",
      "4.0.36",
      "4.0.35",
      "4.0.34",
      "4.0.33", // Previous versions did not not have bug notification system
    ],
  },
  {
    title: "Broken Lambda",
    description: "Lambda rendering fails with IPv6 error.",
    link: "https://github.com/remotion-dev/remotion/pull/3019",
    versions: ["4.0.49"],
  },
  {
    title: "OffthreadVideo could crash",
    description:
      "On some videos, OffthreadVideo could crash without proper error handling.",
    link: "https://github.com/remotion-dev/remotion/pull/2882",
    versions: ["4.0.36", "4.0.37", "4.0.38"],
  },
  {
    title: "Slow OffthreadVideo performance",
    description:
      "Without an explicit cache size, the OffthreadVideo component would run with no cache.",
    link: "https://github.com/remotion-dev/remotion/pull/2882",
    versions: ["4.0.33", "4.0.34", "4.0.35", "4.0.36"],
  },
  {
    title: "<Thumbnail> component would crash",
    description:
      "<Thumbnail> component in a React app would crash if a <Sequence> was used.",
    link: "https://github.com/remotion-dev/remotion/pull/2944",
    versions: ["4.0.43", "4.0.42"],
  },
];

const getVersionBugs = (version: string) => {
  const selectedVersionBugs = bugs.filter((bug) => {
    return bug.versions.includes(version);
  });
  return selectedVersionBugs;
};

export default async function handler(request: Request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET",
        "access-control-allow-headers": "Content-Type",
      },
    });
  }

  const urlParams = new URL(request.url).searchParams;

  const query = Object.fromEntries(urlParams);
  const v = query["v"].replace("v", "") as string;

  const bugs = getVersionBugs(v);

  return new Response(
    JSON.stringify({
      version: v,
      bugs,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
    }
  );
}

export const config = {
  runtime: "edge",
};
