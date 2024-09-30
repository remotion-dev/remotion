import { QueryResult, Stargazer } from "../cache";
import { fetchViaGraphQl } from "./via-graphql";
import { fetchPageViaRest, REST_PER_PAGE } from "./via-rest";

export async function fetchStargazers({
  repoOrg,
  repoName,
  starCount,
  abortSignal,
}: {
  repoOrg: string;
  repoName: string;
  starCount: number;
  abortSignal: AbortSignal;
}) {
  let allStargazers: Stargazer[] = [];

  console.log("Fetching stars...");
  if (!process.env.REMOTION_GITHUB_TOKEN) {
    console.error(
      "No REMOTION_GITHUB_TOKEN environment variable found. Using the GitHub REST API instead of GraphQL, which has a lower rate-limit and does not show the star dates.",
    );

    let page = 0;

    for (let i = 0; i < Math.ceil(starCount / REST_PER_PAGE); i++) {
      const stars = await fetchPageViaRest({
        abortSignal,
        page,
        repoName,
        repoOrg,
      });
      if (stars.length === 0) {
        break;
      }
      allStargazers = [...allStargazers, ...stars];
      console.log(`Fetched ${allStargazers.length} stars`);
      if (allStargazers.length >= starCount) {
        allStargazers = allStargazers.slice(0, starCount);
        break;
      }
      page++;
    }
    return allStargazers;
  }
  let starsLeft = starCount;
  let cursor = null;

  while (starsLeft > 0) {
    const count = Math.min(starsLeft, 100);
    const result = (await fetchViaGraphQl({
      repoOrg,
      repoName,
      count,
      cursor,
      abortSignal,
    })) as QueryResult;

    const { cursor: newCursor, results } = result;
    allStargazers = [...allStargazers, ...results];
    console.log(`Fetched ${allStargazers.length} stars`);
    cursor = newCursor;
    if (results.length < count) {
      starsLeft = 0;
    } else {
      starsLeft -= results.length;
    }
  }

  return allStargazers;
}
