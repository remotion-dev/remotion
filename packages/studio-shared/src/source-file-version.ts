export type SourceFileVersion = {
	sessionId: string;
	revision: number;
};

export type SourceMutationGuard = {
	sessionId: string;
	files: Record<string, number>;
};
