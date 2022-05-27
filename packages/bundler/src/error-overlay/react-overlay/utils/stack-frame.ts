/*
	Source code adapted from https://github.com/facebook/create-react-app/tree/main/packages/react-error-overlay and refactored in Typescript. This file is MIT-licensed.
*/

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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

/**
 * A representation of a stack frame.
 */

export const makeStackFrame = ({
	functionName,
	fileName,
	lineNumber,
	columnNumber,
}: {
	functionName: string | null;
	fileName: string;
	lineNumber: number;
	columnNumber: number;
}): StackFrame => {
	if (functionName && functionName.indexOf('Object.') === 0) {
		functionName = functionName.slice('Object.'.length);
	}

	if (
		// Chrome has a bug with inferring function.name:
		// https://github.com/facebook/create-react-app/issues/2097
		// Let's ignore a meaningless name we get for top-level modules.
		functionName === 'friendlySyntaxErrorLabel' ||
		functionName === 'exports.__esModule' ||
		functionName === '<anonymous>' ||
		!functionName
	) {
		functionName = null;
	}

	return {
		columnNumber,
		fileName,
		functionName,
		lineNumber,
	};
};
