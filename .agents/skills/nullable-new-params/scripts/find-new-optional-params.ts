#!/usr/bin/env bun

type Candidate = {
	readonly file: string;
	readonly line: number;
	readonly code: string;
	readonly reason: string;
};

const decoder = new TextDecoder();
const userArgs = Bun.argv.slice(2);
const gitArgs = ['diff', '--unified=0'];

if (userArgs.length === 0) {
	gitArgs.push('HEAD');
} else {
	gitArgs.push(...userArgs);
}

if (!userArgs.includes('--')) {
	gitArgs.push('--', '*.ts', '*.tsx', '*.mts', '*.cts');
}

const diff = Bun.spawnSync(['git', ...gitArgs], {
	stderr: 'pipe',
	stdout: 'pipe',
});

if (diff.exitCode !== 0) {
	const stderr = decoder.decode(diff.stderr).trim();
	console.error(stderr || 'git diff failed');
	process.exit(diff.exitCode);
}

const optionalMemberPattern =
	/(^|[\s{(,;])(?:readonly\s+)?(?:[A-Za-z_$][\w$]*|["'][^"']+["'])\s*\?:/;
const optionalMethodPattern =
	/(^|[\s{(,;])(?:readonly\s+)?[A-Za-z_$][\w$]*\s*\?\s*(?:<[^>]+>)?\s*\(/;

const isTypeScriptFile = (file: string): boolean => /\.(c|m)?tsx?$/.test(file);

const getReason = (code: string): string | null => {
	const trimmed = code.trim();

	if (
		trimmed.length === 0 ||
		trimmed.startsWith('//') ||
		trimmed.startsWith('*') ||
		trimmed.startsWith('/*')
	) {
		return null;
	}

	if (optionalMemberPattern.test(code)) {
		return 'optional member or parameter (`?:`)';
	}

	if (optionalMethodPattern.test(code)) {
		return 'optional method or function member (`?(`)';
	}

	return null;
};

const candidates: Candidate[] = [];
let currentFile: string | null = null;
let currentLine = 0;

for (const rawLine of decoder.decode(diff.stdout).split('\n')) {
	if (rawLine.startsWith('+++ ')) {
		const file = rawLine.slice(4).trim();
		currentFile = file.startsWith('b/') ? file.slice(2) : null;
		continue;
	}

	const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(rawLine);
	if (hunk) {
		currentLine = Number(hunk[1]);
		continue;
	}

	if (!currentFile || !isTypeScriptFile(currentFile)) {
		continue;
	}

	if (rawLine.startsWith('+') && !rawLine.startsWith('+++')) {
		const code = rawLine.slice(1);
		const reason = getReason(code);
		if (reason) {
			candidates.push({
				file: currentFile,
				line: currentLine,
				code: code.trim(),
				reason,
			});
		}

		currentLine++;
		continue;
	}

	if (rawLine.startsWith(' ') || rawLine === '') {
		currentLine++;
	}
}

if (candidates.length === 0) {
	console.log(
		'No newly added optional members or parameters found in the TypeScript diff.',
	);
	process.exit(0);
}

console.log('New optional member/parameter candidates found:\n');

for (const candidate of candidates) {
	console.log(`${candidate.file}:${candidate.line}`);
	console.log(`  ${candidate.reason}`);
	console.log(`  ${candidate.code}`);
}

console.log(
	'\nFor internal APIs, change these to required nullable values (`name: T | null`) and pass `null` explicitly. Keep optional only for exported/documented public APIs where requiring the value would be breaking.',
);

process.exit(1);
