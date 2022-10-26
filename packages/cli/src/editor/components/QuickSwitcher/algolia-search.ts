import type {TQuickSwitcherResult} from './QuickSwitcherResult';

const AGOLIA_API_KEY = '3e42dbd4f895fe93ff5cf40d860c4a85';
const AGOLIA_APPLICATION_ID = 'PLSDUOL1CA';
const AGOLIA_SEARCH_URL =
	'https://plsduol1ca-dsn.algolia.net/1/indexes/*/queries';

type Levels = 'lvl0' | 'lvl1' | 'lvl2' | 'lvl3' | 'lvl4' | 'lvl5' | 'lvl6';

type Hit = {
	url: string;
	type: Levels;
	hierarchy: Record<Levels, string | null>;
	objectID: string;
};

type AlgoliaResults = {
	results: {
		hits: Hit[];
	}[];
};

export const algoliaSearch = async (
	query: string
): Promise<TQuickSwitcherResult[]> => {
	const url = new URL(AGOLIA_SEARCH_URL);

	url.searchParams.set(
		'x-algolia-agen',
		encodeURIComponent('Remotion Preview DocSearch')
	);
	url.searchParams.set('x-algolia-api-key', AGOLIA_API_KEY);
	url.searchParams.set('x-algolia-application-id', AGOLIA_APPLICATION_ID);

	const {results} = await fetch(url.toString(), {
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
		},
		body: JSON.stringify({
			requests: [
				{
					query,
					indexName: 'remotion',
					params:
						'attributesToRetrieve=["hierarchy.lvl0","hierarchy.lvl1","hierarchy.lvl2","hierarchy.lvl3","hierarchy.lvl4","hierarchy.lvl5","hierarchy.lvl6","content","type","url"]&attributesToSnippet=["hierarchy.lvl1:10","hierarchy.lvl2:10","hierarchy.lvl3:10","hierarchy.lvl4:10","hierarchy.lvl5:10","hierarchy.lvl6:10","content:10"]&snippetEllipsisText=…&highlightPreTag=<mark>&highlightPostTag=</mark>&hitsPerPage=20&facetFilters=[]',
				},
			],
		}),
		method: 'POST',
	}).then((res) => res.json() as Promise<AlgoliaResults>);

	const {hits} = results[0];

	return hits.map((hit) => ({
		type: 'menu-item',
		id: hit.objectID,
		title: hit.hierarchy[hit.type] ?? '',
		onSelected: () => {
			window.open(hit.url);
		},
	}));
};
