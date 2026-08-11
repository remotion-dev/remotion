import {existsSync} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
	createTimestamp,
	listFilesRecursively,
	readJson,
	sanitizePathPart,
	writeJson,
} from './files';
import type {SkillEval} from './manifest';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const evalsRoot = join(packageRoot, '.runs', 'evals');

const evalNameAdjectives = [
	'amber',
	'bright',
	'calm',
	'clear',
	'cosmic',
	'golden',
	'lucky',
	'quiet',
	'silver',
	'swift',
	'vivid',
	'warm',
];

const evalNameNouns = [
	'beacon',
	'comet',
	'falcon',
	'harbor',
	'lantern',
	'meadow',
	'orbit',
	'pilot',
	'river',
	'signal',
	'spark',
	'voyage',
];

const hashString = (value: string) => {
	let hash = 0;

	for (const char of value) {
		hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	}

	return hash;
};

export const createSkillEvalId = (scenarioId: string) =>
	`${createTimestamp()}--${sanitizePathPart(scenarioId)}`;

export const createSkillEvalName = ({
	id,
	type,
}: {
	id: string;
	type: SkillEval['type'];
}) => {
	const hash = hashString(id);
	const adjective = evalNameAdjectives[hash % evalNameAdjectives.length];
	const noun =
		evalNameNouns[
			Math.floor(hash / evalNameAdjectives.length) % evalNameNouns.length
		];
	const suffix = hash.toString(36).slice(0, 4).toUpperCase();
	const prefix = type === 'run' ? 'Run' : 'Comparison';

	return `${prefix} ${adjective} ${noun} ${suffix}`;
};

export const getSkillEvalName = (evaluation: SkillEval) =>
	evaluation.name || createSkillEvalName(evaluation);

export const getSkillEvalDir = (scenarioId: string, evalId: string) =>
	join(evalsRoot, sanitizePathPart(scenarioId), evalId);

export const getSkillEvalPath = (scenarioId: string, evalId: string) =>
	join(getSkillEvalDir(scenarioId, evalId), 'eval.json');

export const toEvalUrl = (evaluation: Pick<SkillEval, 'id' | 'scenarioId'>) =>
	`/evals/${encodeURIComponent(evaluation.scenarioId)}/${encodeURIComponent(
		evaluation.id,
	)}`;

export const writeSkillEval = async (evaluation: SkillEval) => {
	await mkdir(evaluation.evalDir, {recursive: true});
	await writeJson(join(evaluation.evalDir, 'eval.json'), evaluation);
};

export const loadSkillEval = (
	scenarioId: string,
	evalId: string,
): Promise<SkillEval | null> => {
	const file = getSkillEvalPath(scenarioId, evalId);

	if (!existsSync(file)) {
		return Promise.resolve(null);
	}

	return readJson<SkillEval>(file);
};

export const listSkillEvals = async (scenarioId?: string) => {
	const root = scenarioId
		? join(evalsRoot, sanitizePathPart(scenarioId))
		: evalsRoot;
	const files = (await listFilesRecursively(root)).filter((file) =>
		file.endsWith('/eval.json'),
	);
	const evaluations = await Promise.all(
		files.map((file) => readJson<SkillEval>(file)),
	);

	return evaluations.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
};
