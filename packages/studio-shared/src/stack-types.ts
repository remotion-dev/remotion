export type ScriptLine = {
	lineNumber: number;
	content: string;
	highlight: boolean;
};

export type SymbolicatedStackFrame = {
	originalFunctionName: string | null;
	originalFileName: string | null;
	originalLineNumber: number | null;
	originalColumnNumber: number | null;
	originalScriptCode: ScriptLine[] | null;
};

export type StackFrame = {
	functionName: string | null;
	fileName: string;
	lineNumber: number;
	columnNumber: number;
};

export type SomeStackFrame =
	| {
			type: 'symbolicated';
			frame: SymbolicatedStackFrame;
	  }
	| {
			type: 'transpiled';
			frame: StackFrame;
	  };
