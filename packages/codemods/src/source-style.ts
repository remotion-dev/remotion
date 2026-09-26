import type {namedTypes} from 'ast-types';
import * as recast from 'recast';

export type SourceFormattingConfig = {
	bracketSpacing: boolean;
	endOfLine: '\n' | '\r\n';
	indentationUnit: string;
	printWidth: number;
	quote: 'single' | 'double';
	semi: boolean;
	singleQuote: boolean;
	tabWidth: number;
	useTabs: boolean;
};

export const getPreferredQuote = (
	input: string,
	prettierConfigOverride: Record<string, unknown> | null,
): 'single' | 'double' => {
	if (typeof prettierConfigOverride?.singleQuote === 'boolean') {
		return prettierConfigOverride.singleQuote ? 'single' : 'double';
	}

	const importQuote =
		input.match(/\bfrom\s+(['"])/)?.[1] ??
		input.match(/^\s*import\s+(['"])/m)?.[1];
	if (importQuote) {
		return importQuote === "'" ? 'single' : 'double';
	}

	const singleQuotedStrings = input.match(/'(?:\\.|[^'\\])*'/g)?.length ?? 0;
	const doubleQuotedStrings = input.match(/"(?:\\.|[^"\\])*"/g)?.length ?? 0;
	return singleQuotedStrings > doubleQuotedStrings ? 'single' : 'double';
};

export const getObjectCurlySpacing = (
	input: string,
	prettierConfigOverride: Record<string, unknown> | null,
): boolean => {
	if (typeof prettierConfigOverride?.bracketSpacing === 'boolean') {
		return prettierConfigOverride.bracketSpacing;
	}

	const namedImport = input.match(/\bimport\s*{([^}\n]*)}/);
	if (namedImport) {
		return /^\s/.test(namedImport[1]) && /\s$/.test(namedImport[1]);
	}

	return true;
};

export const getIndentationUnit = (
	input: string,
	prettierConfigOverride: Record<string, unknown> | null,
): string => {
	let tabIndentedLines = 0;
	let spaceIndentedLines = 0;
	let previousIndent = '';
	const widths = new Map<number, number>();
	for (const line of input.split(/\r?\n/)) {
		const match = line.match(/^([\t ]*)(\S.*)$/);
		// Comment decoration and blank lines are not indentation levels.
		if (!match || /^(?:\/[/*]|\*)/.test(match[2])) {
			continue;
		}

		const indent = match[1];
		if (indent.includes('\t')) {
			tabIndentedLines++;
		} else if (indent.length > 0) {
			spaceIndentedLines++;
		}

		if (!indent.includes('\t') && !previousIndent.includes('\t')) {
			const difference = Math.abs(indent.length - previousIndent.length);
			if (difference > 0) {
				widths.set(difference, (widths.get(difference) ?? 0) + 1);
			}
		}

		previousIndent = indent;
	}

	if (tabIndentedLines > spaceIndentedLines) {
		return '\t';
	}

	// Prefer the most common change in depth, then the smaller width on ties.
	// The first indented line may be several levels deep or a continuation.
	const indentation = [...widths].sort(
		([widthA, countA], [widthB, countB]) => countB - countA || widthA - widthB,
	)[0]?.[0];
	if (indentation !== undefined) {
		return ' '.repeat(indentation);
	}

	if (prettierConfigOverride?.useTabs === true) {
		return '\t';
	}

	const tabWidth = prettierConfigOverride?.tabWidth;
	return ' '.repeat(
		typeof tabWidth === 'number' && Number.isInteger(tabWidth) && tabWidth > 0
			? tabWidth
			: 2,
	);
};

export const getEndOfLine = (input: string): '\n' | '\r\n' => {
	return input.includes('\r\n') ? '\r\n' : '\n';
};

export const getLineIndent = ({
	input,
	offset,
}: {
	input: string;
	offset: number;
}): string => {
	const lineStart = input.lastIndexOf('\n', offset - 1) + 1;
	return input.slice(lineStart, offset).match(/^\s*/)?.[0] ?? '';
};

export const getSourceFormattingConfig = ({
	input,
	prettierConfigOverride,
}: {
	input: string;
	prettierConfigOverride: Record<string, unknown> | null;
}): SourceFormattingConfig => {
	const indentationUnit = getIndentationUnit(input, prettierConfigOverride);
	const configuredPrintWidth = prettierConfigOverride?.printWidth;
	const configuredTabWidth = prettierConfigOverride?.tabWidth;
	const quote = getPreferredQuote(input, prettierConfigOverride);

	return {
		bracketSpacing: getObjectCurlySpacing(input, prettierConfigOverride),
		endOfLine: getEndOfLine(input),
		indentationUnit,
		printWidth:
			typeof configuredPrintWidth === 'number' ? configuredPrintWidth : 80,
		quote,
		semi:
			typeof prettierConfigOverride?.semi === 'boolean'
				? prettierConfigOverride.semi
				: /;[ \t]*(?:\r?\n|$)/.test(input),
		singleQuote: quote === 'single',
		tabWidth:
			typeof configuredTabWidth === 'number' &&
			Number.isInteger(configuredTabWidth) &&
			configuredTabWidth > 0
				? configuredTabWidth
				: indentationUnit === '\t'
					? 2
					: indentationUnit.length,
		useTabs: indentationUnit === '\t',
	};
};

export const normalizePrintedIndentation = ({
	endOfLine,
	indentationUnit,
	printed,
	tabWidth,
}: {
	endOfLine: '\n' | '\r\n';
	indentationUnit: string;
	printed: string;
	tabWidth: number;
}): string => {
	return printed
		.split(/\r?\n/)
		.map((line) => {
			const spaces = line.match(/^ */)?.[0].length ?? 0;
			const indentationLevels = Math.floor(spaces / tabWidth);
			const remainingSpaces = spaces % tabWidth;
			return `${indentationUnit.repeat(indentationLevels)}${' '.repeat(remainingSpaces)}${line.slice(spaces)}`;
		})
		.join(endOfLine);
};

export const indentContinuationLines = ({
	indent,
	input,
	printed,
}: {
	indent: string;
	input: string;
	printed: string;
}): string => {
	return printed
		.split(/\r?\n/)
		.map((line, index) =>
			index === 0 || line.length === 0 ? line : `${indent}${line}`,
		)
		.join(getEndOfLine(input));
};

export const indentContinuationLinesAtOffset = ({
	input,
	offset,
	printed,
}: {
	input: string;
	offset: number;
	printed: string;
}): string => {
	return indentContinuationLines({
		indent: getLineIndent({input, offset}),
		input,
		printed,
	});
};

export const printNodeWithSourceStyle = ({
	input,
	node,
	prettierConfigOverride,
	wrapColumn,
}: {
	input: string;
	node: namedTypes.Node;
	prettierConfigOverride: Record<string, unknown> | null;
	wrapColumn: number | null;
}): string => {
	const formattingConfig = getSourceFormattingConfig({
		input,
		prettierConfigOverride,
	});
	const printed = recast.prettyPrint(node, {
		objectCurlySpacing: formattingConfig.bracketSpacing,
		quote: formattingConfig.quote,
		tabWidth: formattingConfig.tabWidth,
		useTabs: false,
		...(wrapColumn === null ? {} : {wrapColumn}),
	}).code;
	const withSemicolonStyle = formattingConfig.semi
		? printed
		: printed.replace(/;(?=\r?\n|$)/g, '');

	return normalizePrintedIndentation({
		endOfLine: formattingConfig.endOfLine,
		indentationUnit: formattingConfig.indentationUnit,
		printed: withSemicolonStyle,
		tabWidth: formattingConfig.tabWidth,
	});
};
