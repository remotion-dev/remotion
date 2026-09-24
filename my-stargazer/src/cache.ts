export type QueryResult = {
  cursor: string;
  results: Stargazer[];
};

export type Stargazer = {
  avatarUrl: string;
  name: string;
  date: string;
  login: string;
};

const makeKey = ({
  count,
  cursor,
  repoName,
  repoOrg,
}: {
  repoOrg: string;
  repoName: string;
  count: number;
  cursor: string | null;
}) => {
  return ["__stargazer", repoOrg, repoName, count, cursor].join("-");
};

export const saveResult = ({
  count,
  cursor,
  repoName,
  repoOrg,
  result,
}: {
  repoOrg: string;
  repoName: string;
  count: number;
  cursor: string | null;
  result: QueryResult;
}) => {
  try {
    const key = makeKey({ count, cursor, repoName, repoOrg });
    window.localStorage.setItem(key, JSON.stringify(result));
  } catch (err) {
    // If quota is exceeded, don't cache
    if (!(err as Error).message.toLowerCase().includes("quota")) {
      throw err;
    }
  }
};

export const getFromCache = ({
  count,
  cursor,
  repoName,
  repoOrg,
}: {
  repoOrg: string;
  repoName: string;
  count: number;
  cursor: string | null;
}): QueryResult | null => {
  const key = makeKey({ count, cursor, repoName, repoOrg });
  const value = window.localStorage.getItem(key);
  if (!value) {
    return null;
  }
  return JSON.parse(value);
};
