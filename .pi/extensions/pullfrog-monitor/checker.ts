import {readFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
	createAgentSession,
	DefaultResourceLoader,
	defineTool,
	getAgentDir,
	SessionManager,
	type ExtensionContext,
} from '@earendil-works/pi-coding-agent';
import {formatSnapshotFeedback, getSourceIds} from './aggregate';
import type {
	FindingSeverity,
	FindingVerdict,
	PullfrogFindingVerdict,
	PullfrogSnapshot,
	RepositoryContext,
	SanityResult,
} from './types';
import {createReviewWorktree} from './worktree';

const VERDICTS = new Set<FindingVerdict>([
	'agree',
	'disagree',
	'already-addressed',
	'uncertain',
]);
const SEVERITIES = new Set<FindingSeverity>(['critical', 'important', 'minor']);

const resultParameters = {
	type: 'object',
	additionalProperties: false,
	required: ['summary', 'findings'],
	properties: {
		summary: {type: 'string'},
		findings: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: [
					'sourceId',
					'sourceUrl',
					'verdict',
					'severity',
					'confidence',
					'title',
					'rationale',
					'evidence',
					'suggestedDirection',
					'suggestedValidation',
				],
				properties: {
					sourceId: {type: 'string'},
					sourceUrl: {type: 'string'},
					verdict: {type: 'string', enum: [...VERDICTS]},
					severity: {type: 'string', enum: [...SEVERITIES]},
					confidence: {type: 'number', minimum: 0, maximum: 1},
					title: {type: 'string'},
					rationale: {type: 'string'},
					evidence: {
						type: 'array',
						items: {
							type: 'object',
							additionalProperties: false,
							required: ['path', 'line', 'explanation'],
							properties: {
								path: {type: 'string'},
								line: {anyOf: [{type: 'number'}, {type: 'null'}]},
								explanation: {type: 'string'},
							},
						},
					},
					suggestedDirection: {type: 'string'},
					suggestedValidation: {
						type: 'array',
						items: {type: 'string'},
					},
				},
			},
		},
	},
} as const;

const isStringArray = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every((item) => typeof item === 'string');

const validateFinding = (
	value: unknown,
	allowedSources: Set<string>,
): PullfrogFindingVerdict => {
	if (!value || typeof value !== 'object') {
		throw new Error('The reviewer returned a malformed finding');
	}
	const finding = value as Partial<PullfrogFindingVerdict>;
	if (
		typeof finding.sourceId !== 'string' ||
		!allowedSources.has(finding.sourceId) ||
		typeof finding.sourceUrl !== 'string' ||
		!finding.sourceUrl.startsWith('https://github.com/') ||
		!VERDICTS.has(finding.verdict as FindingVerdict) ||
		!SEVERITIES.has(finding.severity as FindingSeverity) ||
		typeof finding.confidence !== 'number' ||
		finding.confidence < 0 ||
		finding.confidence > 1 ||
		typeof finding.title !== 'string' ||
		typeof finding.rationale !== 'string' ||
		typeof finding.suggestedDirection !== 'string' ||
		!isStringArray(finding.suggestedValidation) ||
		!Array.isArray(finding.evidence)
	) {
		throw new Error('The reviewer returned an invalid finding');
	}
	for (const evidence of finding.evidence) {
		if (
			!evidence ||
			typeof evidence.path !== 'string' ||
			(evidence.line !== null && typeof evidence.line !== 'number') ||
			typeof evidence.explanation !== 'string'
		) {
			throw new Error('The reviewer returned invalid finding evidence');
		}
	}
	return finding as PullfrogFindingVerdict;
};

const buildPrompt = async (snapshot: PullfrogSnapshot) => {
	const template = await readFile(
		join(dirname(fileURLToPath(import.meta.url)), 'sanity-check-prompt.md'),
		'utf8',
	);
	return template
		.replaceAll('{{PR_TITLE}}', () => snapshot.title)
		.replaceAll('{{PR_URL}}', () => snapshot.prUrl)
		.replaceAll('{{PR_NUMBER}}', () => String(snapshot.prNumber))
		.replaceAll('{{LATEST_HEAD}}', () => snapshot.headSha)
		.replaceAll('{{FEEDBACK}}', () => formatSnapshotFeedback(snapshot));
};

type CreateAgentSessionOptions = NonNullable<
	Parameters<typeof createAgentSession>[0]
>;

export const runSanityCheck = async ({
	repository,
	snapshot,
	fingerprint,
	model,
	modelRegistry,
	thinkingLevel,
	signal,
}: {
	repository: RepositoryContext;
	snapshot: PullfrogSnapshot;
	fingerprint: string;
	model: NonNullable<ExtensionContext['model']>;
	modelRegistry: ExtensionContext['modelRegistry'];
	thinkingLevel: NonNullable<CreateAgentSessionOptions['thinkingLevel']>;
	signal: AbortSignal;
}): Promise<SanityResult> => {
	const worktree = await createReviewWorktree(
		repository,
		snapshot.prNumber,
		snapshot.headSha,
	);
	let session:
		| Awaited<ReturnType<typeof createAgentSession>>['session']
		| undefined;
	let submitted: SanityResult | null = null;
	try {
		if (signal.aborted) {
			throw new Error('Pullfrog sanity check was interrupted');
		}
		const allowedSources = getSourceIds(snapshot);
		const submitTool = defineTool({
			name: 'submit_pullfrog_review',
			label: 'Submit Pullfrog sanity review',
			description:
				'Submit the final independently validated Pullfrog findings as the final action.',
			promptSnippet: 'Submit the final Pullfrog sanity-check verdict',
			promptGuidelines: [
				'Call submit_pullfrog_review exactly once as the final action.',
			],
			parameters: resultParameters as never,
			async execute(_toolCallId, params) {
				const value = params as {summary?: unknown; findings?: unknown};
				if (
					typeof value.summary !== 'string' ||
					!Array.isArray(value.findings)
				) {
					throw new Error('The reviewer returned no structured result');
				}
				submitted = {
					fingerprint,
					repository: repository.repository,
					prNumber: snapshot.prNumber,
					prUrl: snapshot.prUrl,
					reviewedHead: snapshot.headSha,
					summary: value.summary,
					findings: value.findings.map((finding) =>
						validateFinding(finding, allowedSources),
					),
				};
				return {
					content: [
						{
							type: 'text' as const,
							text: `Saved ${submitted.findings.length} validated findings.`,
						},
					],
					details: submitted,
					terminate: true,
				};
			},
		});
		const loader = new DefaultResourceLoader({
			cwd: worktree.checkout,
			agentDir: getAgentDir(),
			noExtensions: true,
		});
		await loader.reload();
		const created = await createAgentSession({
			cwd: worktree.checkout,
			model,
			modelRegistry,
			thinkingLevel,
			resourceLoader: loader,
			sessionManager: SessionManager.inMemory(worktree.checkout),
			tools: ['read', 'bash', 'grep', 'find', 'ls', 'submit_pullfrog_review'],
			customTools: [submitTool],
		});
		session = created.session;
		const abort = () => void session?.abort();
		signal.addEventListener('abort', abort, {once: true});
		try {
			await session.prompt(await buildPrompt(snapshot));
		} finally {
			signal.removeEventListener('abort', abort);
		}
		if (!submitted) {
			throw new Error(
				'Background reviewer finished without submitting a structured result',
			);
		}
		return submitted;
	} finally {
		session?.dispose();
		await worktree.remove();
	}
};
