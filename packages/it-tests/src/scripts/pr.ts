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

const goodPrTitle = messages.find((message) => message.message.startsWith('`'));
if (!goodPrTitle) {
	throw new Error(
		'Could not find good PR title. Commit something on this branch with the commit message format "`[package-name]`: description"',
	);
}

const bodyIfThereIsOne =
	await $`git show --format=%b ${goodPrTitle.hash}`.text();

const indexOfDiff = bodyIfThereIsOne.indexOf('\ndiff');

const body = bodyIfThereIsOne.slice(0, indexOfDiff).trim();

await $`git push origin HEAD`;
const output =
	await $`gh pr create --title "${goodPrTitle.message}" --body "${body ?? ''}"`.nothrow();

const prLine = new TextDecoder()
	.decode(output.stderr)
	.trim()
	.split('\n')
	.find((line) => line.startsWith('https://'));

await $`open ${prLine}`;
