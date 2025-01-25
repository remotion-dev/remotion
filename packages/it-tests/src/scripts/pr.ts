import {$} from 'bun';

type CommitMessage = {
	hash: string;
	message: string;
};

const text = await $`git log main..HEAD --oneline`.text();
const lines = text.trim().split('\n');
const messages = lines.map((line: string) => {
	const [hash, ...message] = line.split(' ');
	return {
		hash,
		message: message.join(' '),
	};
}) as CommitMessage[];

if (messages.length === 0) {
	throw new Error('No commits found');
}

const goodPrTitle =
	messages.find((message) => message.message.startsWith('`')) ?? messages[0];

const bodyIfThereIsOne =
	await $`git show --format=%b ${goodPrTitle.hash}`.text();

const indexOfDiff = bodyIfThereIsOne.indexOf('\ndiff');

const body = bodyIfThereIsOne.slice(0, indexOfDiff).trim();

await $`git push origin HEAD`;

const output =
	await $`gh pr create --title "${goodPrTitle.message}" --body "${body || goodPrTitle.message}"`.nothrow();

const prLine = new TextDecoder()
	.decode(output.stderr)
	.trim()
	.split('\n')
	.find((line) => line.startsWith('https://'));

if (!prLine) {
	process.exit(0);
}
await $`open ${prLine}`;
