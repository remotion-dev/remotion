export type Caption = {
	text: string;
	startMs: number;
	endMs: number;
	timestampMs: number | null;
	confidence: number | null;
};
