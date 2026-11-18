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
  const token = process.env.REMOTION_GITHUB_TOKEN?.trim();
  const authenticationInstructions =
    `GitHub requires admin or collaborator access to ${repoOrg}/${repoName} to list its stargazers, even for public repositories. ` +
    "Create a token with access to that repository at https://github.com/settings/personal-access-tokens/new. " +
    "Locally, set REMOTION_GITHUB_TOKEN in your .env file and restart Remotion Studio. " +
    "In GitHub Actions, add a repository secret named REMOTION_GITHUB_TOKEN. " +
    "See the Authentication section in README.md for token permissions and setup.";

  if (!token) {
    throw new Error(
      `REMOTION_GITHUB_TOKEN is missing. ${authenticationInstructions}`,
    );
  }

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
      authorization: `Bearer ${token}`,
    },
    signal: abortSignal,
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const textResponse = await res.text();
    const rateLimited =
      res.headers.get("x-ratelimit-remaining") === "0" ||
      res.headers.has("retry-after") ||
      /rate limit/i.test(textResponse);
    if (res.status === 401 || (res.status === 403 && !rateLimited)) {
      throw new Error(
        `GitHub rejected access to ${repoOrg}/${repoName}. ${authenticationInstructions}\nHTTP ${res.status} ${res.statusText}: ${textResponse}`,
      );
    }

    throw Error(`HTTP ${res.status} ${res.statusText}: ${textResponse}`);
  }

  const json = (await res.json()) as GitHubApiResponse;

  if ("errors" in json) {
    if (
      json.errors.some(
        (error) => error.type === "FORBIDDEN" || error.type === "NOT_FOUND",
      )
    ) {
      throw new Error(
        `GitHub could not load stargazers for ${repoOrg}/${repoName}. Check the repository owner and name. ${authenticationInstructions}\n${JSON.stringify(json.errors)}`,
      );
    }

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
  if (edges.length === 0 && cursor === null) {
    throw new Error(
      `GitHub returned no stargazers for ${repoOrg}/${repoName}. The repository may have no stars, or the token may lack access. ${authenticationInstructions}`,
    );
  }

  const lastCursor = edges[edges.length - 1]?.cursor ?? cursor;

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
