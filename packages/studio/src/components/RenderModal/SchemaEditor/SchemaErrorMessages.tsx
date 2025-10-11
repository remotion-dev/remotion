import type {z} from 'zod';
import {BACKGROUND, BLUE, LIGHT_TEXT} from '../../../helpers/colors';
import {Button} from '../../Button';
import {inlineCodeSnippet} from '../../Menu/styles';
import {Spacing} from '../../layout';
import {ZodErrorMessages} from './ZodErrorMessages';

const explainer: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	padding: '0 12px',
	justifyContent: 'center',
	alignItems: 'center',
	textAlign: 'center',
	background: BACKGROUND,
};

const errorExplanation: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
};

const codeSnippet: React.CSSProperties = {
	fontSize: 14,
	color: BLUE,
	fontFamily: 'monospace',
};

const errorContainer: React.CSSProperties = {
	padding: '8px 12px',
	overflowY: 'auto',
};

const openDocs = () => {
	window.open('https://www.remotion.dev/docs/schemas');
};

export const ZodNotInstalled = () => {
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

export const NoSchemaDefined = () => {
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

export const NoDefaultProps = () => {
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
	zodValidationResult: z.SafeParseReturnType<unknown, unknown>;
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
	zodValidationResult: z.SafeParseReturnType<unknown, unknown>;
	reset: () => void;
}> = ({zodValidationResult, reset}) => {
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
			<Spacing y={1} block />
			<div style={errorExplanation}>
				Alternatively, reset the data to the{' '}
				<code style={inlineCodeSnippet}>defaultProps</code> that you have
				defined.
			</div>
			<Spacing y={1} block />
			<Button onClick={reset}>Reset props</Button>
		</div>
	);
};

export const TopLevelZodValue: React.FC<{
	typeReceived: string;
}> = ({typeReceived}) => {
	return (
		<div style={explainer}>
			<div style={errorExplanation}>
				The top-level type of the schema must be a pure{' '}
				<code style={codeSnippet}>z.object</code>. Instead got a schema of type{' '}
				<code style={codeSnippet}>{typeReceived}</code>
			</div>
			<Spacing y={1} />
			<div style={errorExplanation}>
				Fix the schema by changing the top-level Zod type to an object.
			</div>
			<Spacing y={2} block />
			<Button onClick={openDocs}>Learn more</Button>
		</div>
	);
};
