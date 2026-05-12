import type {CommandResult} from './command';
import type {SkillEvalScenario} from './scenarios';

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
		piExport: LoggedCommand;
	};
};

export type SkillEvalResult = {
	manifest: SkillEvalManifest;
	manifestPath: string;
	scenario: SkillEvalScenario;
};

export type SkillEvalComparison = {
	id: string;
	scenarioId: string;
	createdAt: string;
	completedAt: string;
	comparisonDir: string;
	skillDiffPath: string;
	before: {
		label: 'before';
		skillsPath: string;
		hash: string;
		gitRef?: string;
		comparisonId?: string;
		manifestPath: string;
	};
	after: {
		label: 'after';
		skillsPath: string;
		hash: string;
		isWorkingTree: boolean;
		manifestPath: string;
	};
};
