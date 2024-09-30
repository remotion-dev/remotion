import { QueryResult, Stargazer, getFromCache, saveResult } from "../cache";

type Edge = {
  starredAt: string;
  node: {
    avatarUrl: string;
    name?: string;
    login: string;
  };
  cursor: string;
};

type ApiError =
  | {
      type: "RATE_LIMITED";
      message: string;
    }
  | {
      type: string;
      message: string;
    };

type GitHubApiResponse =
  | {
      data: {
        repository: {
          stargazers: {
            edges: Edge[];
          };
        };
      };
    }
  | {
      errors: ApiError[];
    };

export const fetchViaGraphQl = async ({
  count,
  cursor,
  repoName,
  repoOrg,
  abortSignal,
}: {
  repoOrg: string;
  repoName: string;
  count: number;
  cursor: string | null;
  abortSignal: AbortSignal;
}): Promise<QueryResult> => {
  const cache = getFromCache({ repoOrg, repoName, count, cursor });
  if (cache) {
    return cache;
  }
  const query = `{
		repository(owner: "${repoOrg}", name: "${repoName}") {
			stargazers(first: ${count}${cursor ? `, after: "${cursor}"` : ""}) {
				edges {
					starredAt
					node {
						avatarUrl
						name
						login
					}
					cursor
				}
			}
		}
	}`;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `token ${process.env.REMOTION_GITHUB_TOKEN}`,
    },
    signal: abortSignal,
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const textResponse = await res.text();
    throw Error(`HTTP ${res.status} ${res.statusText}: ${textResponse}`);
  }

  const json = (await res.json()) as GitHubApiResponse;

  if ("errors" in json) {
    if (json.errors[0].type === "RATE_LIMITED") {
      console.error("Rate limit exceeded, waiting 1 minute...");
      await new Promise((resolve) => {
        setTimeout(resolve, 60 * 1000);
      });
      return fetchViaGraphQl({ repoOrg, repoName, count, cursor, abortSignal });
    }
    throw new Error(JSON.stringify(json.errors));
  }

  const { edges } = json.data.repository.stargazers;
  const lastCursor = edges[edges.length - 1].cursor;

  const page: Stargazer[] = edges.map((edge) => {
    return {
      avatarUrl: edge.node.avatarUrl,
      date: edge.starredAt,
      name: edge.node.name || edge.node.login,
      login: edge.node.login,
    };
  });

  const result = { cursor: lastCursor, results: page };
  saveResult({ repoOrg, repoName, count, cursor, result });

  return result;
};
