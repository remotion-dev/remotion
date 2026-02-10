import fs from 'fs';
import path from 'path';

const REMOTION_PRO_ORIGIN = 'https://www.remotion.pro';

type PromptResponse = {
	items: unknown[];
	nextCursor: string | null;
};

const fetchAllPromptSubmissions = async () => {
	const allPromptSubmissions: unknown[] = [];
	let cursor: string | null = null;

	do {
		const url = cursor
			? `${REMOTION_PRO_ORIGIN}/api/prompts?cursor=${cursor}`
			: `${REMOTION_PRO_ORIGIN}/api/prompts`;

		const res = await fetch(url);
		const data: PromptResponse = await res.json();

		allPromptSubmissions.push(...data.items);
		cursor = data.nextCursor;
	} while (cursor);

	return allPromptSubmissions;
};

fetchAllPromptSubmissions().then((promptSubmissions) => {
	fs.writeFileSync(
		path.join(process.cwd(), 'static', '_raw', 'prompt-submissions.json'),
		JSON.stringify(promptSubmissions, null, '\t'),
	);

	console.log(`Fetched ${promptSubmissions.length} prompt submissions`);
});
