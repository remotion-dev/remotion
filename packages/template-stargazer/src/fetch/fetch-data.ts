import { QueryResult, Stargazer } from "../cache";
import { fetchViaGraphQl } from "./via-graphql";

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
