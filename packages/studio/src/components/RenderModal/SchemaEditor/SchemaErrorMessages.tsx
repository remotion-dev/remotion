// Schema error messages for studio editor
import type {CSSProperties, ReactNode} from 'react';
import {BACKGROUND, BLUE, LIGHT_TEXT} from '../../../helpers/colors';
import {Button} from '../../Button';
import {CompactExplanation} from '../../CompactExplanation';
import {Spacing} from '../../layout';
import {inlineCodeSnippet} from '../../Menu/styles';
import type {ZodSafeParseResult} from './zod-schema-type';
import {ZodErrorMessages} from './ZodErrorMessages';

const explainer: CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	padding: 12,
	alignItems: 'flex-start',
	textAlign: 'left',
	background: BACKGROUND,
};

export type SchemaErrorMode = 'full' | 'compact';

const errorExplanation: CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
};

const codeSnippet: CSSProperties = {
	fontSize: 14,
	color: BLUE,
	fontFamily: 'monospace',
};

const errorContainer: CSSProperties = {
	padding: '8px 12px',
	overflowY: 'auto',
};

const openDocs = () => {
	window.open('https://www.remotion.dev/docs/schemas');
};

const CompactSchemaError = ({children}: {readonly children: ReactNode}) => {
	return (
		<CompactExplanation
			learnMoreHref="https://www.remotion.dev/docs/schemas"
			learnMoreAriaLabel="Learn more about schemas"
		>
			{children}
		</CompactExplanation>
	);
};

export const ZodNotInstalled: React.FC<{
	readonly mode?: SchemaErrorMode;
}> = ({mode = 'full'}) => {
	if (mode === 'compact') {
		return <CompactSchemaError>Install zod to edit props.</CompactSchemaError>;
	}

	return (
		<div style={explainer}>
			<div style={errorExplanation}>
				Install <code style={inlineCodeSnippet}>zod</code> as a dependency to
				interactively control the props of the composition.
			</div>
			<Spacing y={2} block />
			<Button onClick={openDocs}>Learn how</Button>
		</div>
	);
};

export const NoSchemaDefined: React.FC<{
	readonly mode?: SchemaErrorMode;
}> = ({mode = 'full'}) => {
	if (mode === 'compact') {
		return (
			<CompactSchemaError>Add a schema prop to edit props.</CompactSchemaError>
		);
	}

	return (
		<div style={explainer}>
			<div style={errorExplanation}>
				Make the props of this composition interactively editable by adding a{' '}
				<code style={inlineCodeSnippet}>schema</code> prop to the{' '}
				<code style={inlineCodeSnippet}>{'<Composition>'}</code> component.
			</div>
			<Spacing y={2} block />
			<Button onClick={openDocs}>Learn how</Button>
		</div>
	);
};

export const NoDefaultProps: React.FC<{
	readonly mode?: SchemaErrorMode;
}> = ({mode = 'full'}) => {
	if (mode === 'compact') {
		return (
			<CompactSchemaError>
				Add defaultProps to edit the schema.
			</CompactSchemaError>
		);
	}

	return (
		<div style={explainer}>
			<div style={errorExplanation}>
				The schema can not be edited because the{' '}
				<code style={inlineCodeSnippet}>defaultProps</code> prop in the{' '}
				<code style={inlineCodeSnippet}>{'<Composition>'}</code> does not exist.
			</div>
			<Spacing y={1} />
			<div style={errorExplanation}>
				Fix the schema by adding a{' '}
				<code style={inlineCodeSnippet}>defaultProps</code> prop to your
				composition.
			</div>
			<Spacing y={2} block />
			<Button onClick={openDocs}>Learn more</Button>
		</div>
	);
};

export const InvalidDefaultProps: React.FC<{
	zodValidationResult: ZodSafeParseResult;
}> = ({zodValidationResult}) => {
	return (
		<div style={errorContainer}>
			<div style={errorExplanation}>
				The schema can not be edited because the{' '}
				<code style={inlineCodeSnippet}>defaultProps</code> prop in the{' '}
				<code style={inlineCodeSnippet}>{'<Composition>'}</code> is not valid:
			</div>
			<Spacing y={1} block />
			<ZodErrorMessages
				zodValidationResult={zodValidationResult}
				viewTab="schema"
			/>
			<Spacing y={1} block />
			<div style={errorExplanation}>
				Fix the schema by changing the{' '}
				<code style={inlineCodeSnippet}>defaultProps</code> prop in your
				composition so it does not give a type error.
			</div>
		</div>
	);
};

export const InvalidSchema: React.FC<{
	zodValidationResult: ZodSafeParseResult;
}> = ({zodValidationResult}) => {
	return (
		<div style={errorContainer}>
			<div style={errorExplanation}>The data does not satisfy the schema:</div>
			<Spacing y={1} block />
			<ZodErrorMessages
				zodValidationResult={zodValidationResult}
				viewTab="schema"
			/>
			<Spacing y={1} block />
			<div style={errorExplanation}>Fix the schema using the JSON editor.</div>
		</div>
	);
};

export const TopLevelZodValue: React.FC<{
	readonly typeReceived: string;
	readonly mode?: SchemaErrorMode;
}> = ({typeReceived, mode = 'full'}) => {
	if (mode === 'compact') {
		return (
			<CompactSchemaError>
				Use z.object() or z.discriminatedUnion() for the top-level schema.
			</CompactSchemaError>
		);
	}

	return (
		<div style={explainer}>
			<div style={errorExplanation}>
				The top-level type of the schema must be{' '}
				<code style={codeSnippet}>z.object()</code> or{' '}
				<code style={codeSnippet}>z.discriminatedUnion()</code>. Instead got a
				schema of type <code style={codeSnippet}>{typeReceived}</code>
			</div>
			<Spacing y={1} />
			<div style={errorExplanation}>
				Fix the schema by changing the top-level Zod type to an object or
				discriminated union.
			</div>
			<Spacing y={2} block />
			<Button onClick={openDocs}>Learn more</Button>
		</div>
	);
};
