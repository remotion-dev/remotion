export type EditorToken = {startIndex: number; scopes: string};

export type EditorShot = {
	id: 'chapters' | 'duplicate' | 'styles' | 'captions';
	fileName: string;
	source: string;
	code: string;
	finalCode: string;
	tokens: EditorToken[][];
	finalTokens: EditorToken[][];
	frameCount: number;
	fontSize: number;
	lineHeight: number;
	firstVisibleLine: number;
	folds: {start: number; end: number}[];
	anchors: {label: string; line: number}[];
};
