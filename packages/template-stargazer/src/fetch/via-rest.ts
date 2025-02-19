import { Stargazer } from "../cache";

export const REST_PER_PAGE = 100;

type GitHubApiResponse = {
  starred_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}[];

export const fetchPageViaRest = async ({
  abortSignal,
  page,
  repoName,
  repoOrg,
}: {
  repoOrg: string;
  repoName: string;
  page: number;
  abortSignal: AbortSignal;
}): Promise<Stargazer[]> => {
  const url = `https://api.github.com/repos/${repoOrg}/${repoName}/stargazers?per_page=${REST_PER_PAGE}&page=${page}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3.star+json",
      ...(process.env.REMOTION_GITHUB_TOKEN && {
        Authorization: `Bearer ${process.env.REMOTION_GITHUB_TOKEN}`,
      }),
    },
    signal: abortSignal,
  });
  const rateLimitHit = res.status === 403 || res.status === 429;
  if (rateLimitHit) {
    console.error("GitHub REST API rate limit hit. Waiting 1 minute...");
    await new Promise((resolve) => {
      setTimeout(resolve, 60 * 1000);
    });
    return fetchPageViaRest({ repoOrg, repoName, page, abortSignal });
  }

  const json = (await res.json()) as GitHubApiResponse;
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} (${url})`);
  }
  return json.map((item) => {
    return {
      avatarUrl: item.user.avatar_url,
      login: item.user.login,
      name: item.user.login,
      date: item.starred_at,
    };
  });
};
