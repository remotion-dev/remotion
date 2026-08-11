import type {SkillEvalScenario} from '../scenarios';
import type {CommandResult} from './command';

export type SkillSnapshot = {
	sourcePath: string;
	sandboxPath: string;
	hash: string;
	label?: 'before' | 'after';
	gitRef?: string;
	comparisonId?: string;
	isWorkingTree?: boolean;
};

export type VisualArtifact = {
	path: string;
	relativePath: string;
	sizeInBytes: number;
	type: 'image' | 'video';
};

export type LoggedCommand = Pick<
	CommandResult,
	'command' | 'cwd' | 'durationMs' | 'exitCode'
> & {
	stdoutPath: string;
	stderrPath: string;
};

export type SkillEvalManifest = {
	id: string;
	evalId?: string;
	evalRunIndex?: number;
	model: string;
	prompt: string;
	createdAt: string;
	completedAt: string;
	runDir: string;
	projectRoot: string;
	skillSnapshot: SkillSnapshot;
	pi: {
		sessionFile: string;
		htmlExport: string;
	};
	artifacts: VisualArtifact[];
	commands: {
		install: LoggedCommand;
		pi: LoggedCommand;
		piRender: LoggedCommand;
		piExport: LoggedCommand;
	};
};

export type SkillEvalResult = {
	manifest: SkillEvalManifest;
	manifestPath: string;
	scenario: SkillEvalScenario;
};

export type SkillEvalComparisonBeforeRun = {
	label: 'before';
	source: 'git-ref' | 'head';
	skillsPath: string;
	hash: string;
	gitRef?: string;
	comparisonId?: string;
	manifestPath: string;
};

export type SkillEvalComparisonAfterRun = {
	label: 'after';
	skillsPath: string;
	hash: string;
	isWorkingTree: boolean;
	manifestPath: string;
};

export type SkillEvalComparisonRunPair = {
	after: SkillEvalComparisonAfterRun;
	before: SkillEvalComparisonBeforeRun;
	index: number;
};

export type SkillEvalComparison = {
	id: string;
	evalId?: string;
	scenarioId: string;
	createdAt: string;
	completedAt: string;
	comparisonDir: string;
	skillDiffPath: string;
	before: SkillEvalComparisonBeforeRun;
	after: SkillEvalComparisonAfterRun;
	runCount?: number;
	runs?: SkillEvalComparisonRunPair[];
};

export type SkillEvalRunEntry = {
	index: number;
	manifestPath: string;
};

type SkillEvalBase = {
	id: string;
	scenarioId: string;
	name: string;
	createdAt: string;
	completedAt: string;
	evalDir: string;
	runCount: number;
};

export type SkillEvalRun = SkillEvalBase & {
	runs: SkillEvalRunEntry[];
	type: 'run';
};

export type SkillEvalComparisonEval = SkillEvalBase & {
	comparisonPath: string;
	type: 'comparison';
};

export type SkillEval = SkillEvalComparisonEval | SkillEvalRun;
