import React, {useCallback} from 'react';
import {z} from 'remotion';
import {Button} from '../../../../preview-server/error-overlay/remotion-overlay/Button';
import {LIGHT_TEXT} from '../../../helpers/colors';
import {Spacing} from '../../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../../Menu/is-menu-item';
import {ZodErrorMessages} from './ZodErrorMessages';
import {ZodObjectEditor} from './ZodObjectEditor';

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

const scrollable: React.CSSProperties = {
	padding: '8px 12px',
	display: 'flex',
	flexDirection: 'column',
	overflowY: 'auto',
};

export const SchemaEditor: React.FC<{
	schema: z.ZodTypeAny;
	value: unknown;
	setValue: React.Dispatch<React.SetStateAction<unknown>>;
	zodValidationResult: z.SafeParseReturnType<unknown, unknown>;
	compact: boolean;
	defaultProps: unknown;
	onSave: (updater: (oldState: unknown) => unknown) => void;
	showSaveButton: boolean;
}> = ({
	schema,
	value,
	setValue,
	zodValidationResult,
	compact,
	defaultProps,
	onSave,
	showSaveButton,
}) => {
	const def: z.ZodTypeDef = schema._def;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typeName = (def as any).typeName as z.ZodFirstPartyTypeKind;

	const reset = useCallback(() => {
		setValue(defaultProps);
	}, [defaultProps, setValue]);

	const openDocs = useCallback(() => {
		window.open(
			'https://v4.remotion.dev/docs/parametrized-rendering#define-a-schema-'
		);
	}, []);

	if (typeName === z.ZodFirstPartyTypeKind.ZodAny) {
		return (
			<div
				style={{
					backgroundColor: 'red',
					display: 'flex',
					flex: 1,
					flexDirection: 'column',
				}}
			>
				<div style={errorExplanation}>
					Make the props of this composition interactively editable by adding a{' '}
					<code style={codeSnippet}>schema</code> prop to the{' '}
					<code style={codeSnippet}>{'<Composition>'}</code> component.
				</div>
				<Spacing y={2} block />
				<Button onClick={openDocs}>Learn how</Button>
			</div>
		);
	}

	if (!zodValidationResult.success) {
		if (defaultProps === undefined) {
			return (
				<div>
					<div style={errorExplanation}>
						The schema can not be edited because the{' '}
						<code style={codeSnippet}>defaultProps</code> prop in the{' '}
						<code style={codeSnippet}>{'<Composition>'}</code> does not exist.
					</div>
					<Spacing y={1} />
					<div style={errorExplanation}>
						Fix the schema by adding a{' '}
						<code style={codeSnippet}>defaultProps</code> prop to your
						composition.
					</div>
				</div>
			);
		}

		const defaultPropsValid = schema.safeParse(defaultProps);

		if (!defaultPropsValid.success) {
			return (
				<div>
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
						<code style={codeSnippet}>defaultProps</code> prop in your
						composition so it does not give a type error.
					</div>
				</div>
			);
		}

		return (
			<div>
				<div style={errorExplanation}>
					The data does not satisfy the schema:
				</div>
				<Spacing y={1} block />
				<ZodErrorMessages zodValidationResult={zodValidationResult} />
				<Spacing y={1} block />
				<div style={errorExplanation}>
					Fix the schema using the JSON editor.
				</div>
				<Spacing y={1} block />
				<div style={errorExplanation}>
					Alternatively, reset the data to the <code>defaultProps</code> that
					you have defined.
				</div>
				<Spacing y={1} block />
				<Button onClick={reset}>Reset props</Button>
			</div>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodObject) {
		return (
			<div style={scrollable} className={VERTICAL_SCROLLBAR_CLASSNAME}>
				<ZodObjectEditor
					value={value}
					setValue={setValue}
					jsonPath={[]}
					schema={schema}
					compact={compact}
					defaultValue={defaultProps}
					onSave={
						onSave as (
							newValue: (
								oldVal: Record<string, unknown>
							) => Record<string, unknown>
						) => void
					}
					showSaveButton={showSaveButton}
					onRemove={null}
				/>
			</div>
		);
	}

	return null;
};
