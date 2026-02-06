import fs from 'fs';
import path from 'path';

const REMOTION_PRO_ORIGIN = 'https://www.remotion.pro';

type PromptResponse = {
	items: unknown[];
	nextCursor: string | null;
};

const fetchAllPrompts = async () => {
	const allPrompts: unknown[] = [];
	let cursor: string | null = null;

	do {
		const url = cursor
			? `${REMOTION_PRO_ORIGIN}/api/prompts?cursor=${cursor}`
			: `${REMOTION_PRO_ORIGIN}/api/prompts`;

		const res = await fetch(url);
		const data: PromptResponse = await res.json();

		allPrompts.push(...data.items);
		cursor = data.nextCursor;
	} while (cursor);

	return allPrompts;
};

fetchAllPrompts().then((prompts) => {
	fs.writeFileSync(
		path.join(process.cwd(), 'static', '_raw', 'prompts.json'),
		JSON.stringify(prompts, null, '\t'),
	);

	console.log(`Fetched ${prompts.length} prompts`);
});
