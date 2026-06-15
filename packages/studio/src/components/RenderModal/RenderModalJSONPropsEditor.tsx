import React, {useCallback, useEffect, useMemo} from 'react';
import {useContext} from 'react';
import type {SerializedJSONWithCustomFields} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {FAIL_COLOR} from '../../helpers/colors';
import {Button} from '../Button';
import {Flex, Row, Spacing} from '../layout';
import {RemTextarea} from '../NewComposition/RemTextarea';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import type {State} from './DataEditor';
import {deepEqual} from './SchemaEditor/deep-equal';
import type {AnyZodSchema} from './SchemaEditor/zod-schema-type';
import {zodSafeParse} from './SchemaEditor/zod-schema-type';
import {ZodErrorMessages} from './SchemaEditor/ZodErrorMessages';

const style: React.CSSProperties = {
	fontFamily: 'monospace',
	flex: 1,
};

const inspectorStyle: React.CSSProperties = {
	fontFamily: 'monospace',
	boxSizing: 'border-box',
	flex: 'none',
	minHeight: 220,
	overflowY: 'hidden',
};

const scrollable: React.CSSProperties = {
	padding: '8px 12px',
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
};

const inspectorScrollable: React.CSSProperties = {
	...scrollable,
	flex: 'none',
};

const parseJS = (
	value: Record<string, unknown>,
	schema: AnyZodSchema,
): State => {
	try {
		const zodValidation = zodSafeParse(schema, value);
		return {
			str: JSON.stringify(value, null, 2),
			value,
			validJSON: true,
			zodValidation,
		};
	} catch (e) {
		return {
			str: JSON.stringify(value, null, 2),
			validJSON: false,
			error: (e as Error).message,
		};
	}
};

const parseJSON = (str: string, schema: AnyZodSchema): State => {
	try {
		const value = NoReactInternals.deserializeJSONWithSpecialTypes(str);
		const zodValidation = zodSafeParse(schema, value);
		return {str, value, validJSON: true, zodValidation};
	} catch (e) {
		return {str, validJSON: false, error: (e as Error).message};
	}
};

export const RenderModalJSONPropsEditor: React.FC<{
	readonly value: unknown;
	readonly setValue: React.Dispatch<
		React.SetStateAction<Record<string, unknown>>
	>;
	readonly onSave: () => void;
	readonly serializedJSON: SerializedJSONWithCustomFields | null;
	readonly defaultProps: Record<string, unknown>;
	readonly schema: AnyZodSchema;
	readonly compositionId: string;
	readonly layout?: 'default' | 'inspector';
}> = ({
	setValue,
	value,
	defaultProps,
	onSave,
	serializedJSON,
	schema,
	compositionId,
	layout = 'default',
}) => {
	if (serializedJSON === null) {
		throw new Error('expecting serializedJSON to be defined');
	}

	const {subscribeToEvent} = useContext(StudioServerConnectionCtx);
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	const [localValue, setLocalValue] = React.useState<State>(() => {
		return parseJSON(serializedJSON.serializedString, schema);
	});

	useEffect(() => {
		const unsub = subscribeToEvent('default-props-updatable-changed', (e) => {
			if (e.type !== 'default-props-updatable-changed') {
				return;
			}

			if (e.compositionId !== compositionId) {
				return;
			}

			const {result} = e;
			if (result.canUpdate) {
				const deserialized = NoReactInternals.deserializeJSONWithSpecialTypes<
					Record<string, unknown>
				>(JSON.stringify(result.currentDefaultProps));
				const nextState = parseJS(deserialized, schema);
				setLocalValue(nextState);
			}
		});

		return () => {
			unsub();
		};
	}, [subscribeToEvent, compositionId, schema]);

	useEffect(() => {
		setLocalValue((prev) => {
			if (prev.validJSON && deepEqual(value, prev.value)) {
				return prev;
			}

			return parseJS(value as Record<string, unknown>, schema);
		});
	}, [value, schema]);

	const onPretty = useCallback(() => {
		if (!localValue.validJSON) {
			return;
		}

		const parsed = JSON.parse(localValue.str);
		setLocalValue({...localValue, str: JSON.stringify(parsed, null, 2)});
	}, [localValue, setLocalValue]);

	const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
		(e) => {
			const parsed = parseJSON(e.target.value, schema);
			setLocalValue(parsed);
			if (parsed.validJSON && parsed.zodValidation.success) {
				setValue(parsed.value);
			}
		},
		[schema, setValue],
	);

	const hasError = useMemo(() => {
		return !localValue.validJSON || !localValue.zodValidation.success;
	}, [localValue]);

	const hasChanged = useMemo(() => {
		return !deepEqual(value, defaultProps);
	}, [defaultProps, value]);

	const onQuickSave = useCallback(() => {
		if (hasChanged && !hasError) {
			onSave();
		}
	}, [hasChanged, hasError, onSave]);

	// If schema is changed in code
	useEffect(() => {
		setLocalValue((v) => parseJSON(v.str, schema));
	}, [schema]);

	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea === null) {
			return;
		}

		if (layout !== 'inspector') {
			textarea.style.height = '';
			return;
		}

		textarea.style.height = 'auto';
		textarea.style.height = `${Math.max(textarea.scrollHeight + 2, 220)}px`;
	}, [layout, localValue.str]);

	const reset = useCallback(() => {
		setValue(defaultProps);
		setLocalValue(parseJSON(JSON.stringify(defaultProps, null, 2), schema));
	}, [defaultProps, schema, setValue]);

	const textAreaStyle: React.CSSProperties = useMemo(() => {
		const baseStyle = layout === 'inspector' ? inspectorStyle : style;
		if (!hasError) {
			return baseStyle;
		}

		return {
			...baseStyle,
			borderColor: FAIL_COLOR,
		};
	}, [hasError, layout]);

	return (
		<div style={layout === 'inspector' ? inspectorScrollable : scrollable}>
			<RemTextarea
				ref={textareaRef}
				onChange={onChange}
				onBlur={onQuickSave}
				value={localValue.str}
				status={localValue.validJSON ? 'ok' : 'error'}
				style={textAreaStyle}
			/>
			<Spacing y={1} />
			<div data-testid="json-props-error">
				{localValue.validJSON === false ? (
					<ValidationMessage
						align="flex-start"
						message={localValue.error}
						type="error"
						size={layout === 'inspector' ? 'compact' : 'default'}
					/>
				) : localValue.zodValidation.success === false ? (
					<ZodErrorMessages
						zodValidationResult={localValue.zodValidation}
						viewTab="json"
						size={layout === 'inspector' ? 'compact' : 'default'}
					/>
				) : null}
			</div>
			<Spacing y={1} />
			<Row>
				<Button
					disabled={!(hasChanged || !localValue.validJSON)}
					onClick={reset}
				>
					Reset
				</Button>
				<Flex />
				<Button disabled={!localValue.validJSON} onClick={onPretty}>
					Format
				</Button>
				<Spacing x={1} />
			</Row>
		</div>
	);
};
