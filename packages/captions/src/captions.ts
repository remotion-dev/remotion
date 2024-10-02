export type Caption = {
	text: string;
	timestampMs: number | null;
	startMs: number;
	endMs: number;
	confidence: number | null;
};
