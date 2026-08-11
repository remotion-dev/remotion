const DISCORD_MAX_LENGTH = 2000;

const tag = process.argv[2];

const url = tag
	? `https://api.github.com/repos/remotion-dev/remotion/releases/tags/${tag}`
	: 'https://api.github.com/repos/remotion-dev/remotion/releases?per_page=1';

const latestRelease = await fetch(url);

const response = await latestRelease.json();
const release = tag ? response : response[0];

const markdown = [
	`${release.tag_name} has been released!`,
	`<:merge:909914451447259177> ${release.html_url}`,
	...release.body.split('\n').map((s: string) => {
		if (s.startsWith('## ')) {
			return s.replace('## ', '**<:love:989990489824559104> ') + '**';
		}
		return s;
	}),
]
	.filter(Boolean)
	.join('\n');

const splitIntoChunks = (text: string): string[] => {
	const chunks: string[] = [];
	let remaining = text;

	while (remaining.length > 0) {
		if (remaining.length <= DISCORD_MAX_LENGTH) {
			chunks.push(remaining);
			break;
		}

		const slice = remaining.slice(0, DISCORD_MAX_LENGTH);
		const lastNewline = slice.lastIndexOf('\n');
		const splitAt = lastNewline > 0 ? lastNewline : DISCORD_MAX_LENGTH;

		chunks.push(remaining.slice(0, splitAt));
		remaining = remaining.slice(splitAt).replace(/^\n/, '');
	}

	return chunks;
};

const chunks = splitIntoChunks(markdown);

for (const chunk of chunks) {
	const res = await fetch(
		`https://discord.com/api/channels/994527481598070815/messages`,
		{
			method: 'post',
			body: JSON.stringify({
				content: chunk,
				allowed_mentions: {},
				flags: 1 << 2,
			}),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
			},
		},
	);

	if (res.status !== 200) {
		console.log(await res.text());
		process.exit(1);
	}
}

export {};
