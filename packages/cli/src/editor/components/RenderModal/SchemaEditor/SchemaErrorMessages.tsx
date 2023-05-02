import type {z} from 'zod';
import {Button} from '../../../../preview-server/error-overlay/remotion-overlay/Button';
import {LIGHT_TEXT} from '../../../helpers/colors';
import {Spacing} from '../../layout';
import {SchemaEmptyStateGraphic} from './SchemaEmptyStateGraphic';
import {ZodErrorMessages} from './ZodErrorMessages';

const explainer: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	padding: '0 12px',
	justifyContent: 'center',
	alignItems: 'center',
	textAlign: 'center',
};

const errorExplanation: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
};

const codeSnippet: React.CSSProperties = {
	fontSize: 14,
	color: 'var(--blue)',
	fontFamily: 'monospace',
};

const errorContainer: React.CSSProperties = {
	padding: '8px 12px',
	overflowY: 'auto',
};

const openDocs = () => {
	window.open(
		// TODO: Make sure to update this link when we release v4
		'https://v4.remotion.dev/docs/parametrized-rendering#define-a-schema-'
	);
};

export const ZodNotInstalled = () => {
	return (
		<div style={explainer}>
			<div style={errorExplanation}>
				Install <code style={codeSnippet}>zod</code> as a dependency to
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
			<SchemaEmptyStateGraphic />
			<Spacing y={5} />
			<div style={errorExplanation}>
				Make the props of this composition interactively editable by adding a{' '}
				<code style={codeSnippet}>schema</code> prop to the{' '}
				<code style={codeSnippet}>{'<Composition>'}</code> component.
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
				<code style={codeSnippet}>defaultProps</code> prop in the{' '}
				<code style={codeSnippet}>{'<Composition>'}</code> does not exist.
			</div>
			<Spacing y={1} />
			<div style={errorExplanation}>
				Fix the schema by adding a <code style={codeSnippet}>defaultProps</code>{' '}
				prop to your composition.
			</div>
			<Spacing y={2} block />
			<Button onClick={openDocs}>Learn more</Button>
		</div>
	);
};

export const InvalidDefaultProps: React.FC<{
	zodValidationResult: z.SafeParseReturnType<unknown, unknown>;
}> = ({zodValidationResult}) => {
	// TODO: Does not react to when schema is updated

	return (
		<div style={errorContainer}>
			<div style={errorExplanation}>
				The schema can not be edited because the{' '}
				<code style={codeSnippet}>defaultProps</code> prop in the{' '}
				<code style={codeSnippet}>{'<Composition>'}</code> is not valid:
			</div>
			<Spacing y={1} block />
			<ZodErrorMessages zodValidationResult={zodValidationResult} />
			<Spacing y={1} block />
			<div style={errorExplanation}>
				Fix the schema by changing the{' '}
				<code style={codeSnippet}>defaultProps</code> prop in your composition
				so it does not give a type error.
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
			<ZodErrorMessages zodValidationResult={zodValidationResult} />
			<Spacing y={1} block />
			<div style={errorExplanation}>Fix the schema using the JSON editor.</div>
			<Spacing y={1} block />
			<div style={errorExplanation}>
				Alternatively, reset the data to the <code>defaultProps</code> that you
				have defined.
			</div>
			<Spacing y={1} block />
			<Button onClick={reset}>Reset props</Button>
		</div>
	);
};
