import React, {useCallback, useEffect, useMemo} from 'react';
import type {SerializedJSONWithCustomFields} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
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

const scrollable: React.CSSProperties = {
	padding: '8px 12px',
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
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
}> = ({setValue, value, defaultProps, onSave, serializedJSON, schema}) => {
	if (serializedJSON === null) {
		throw new Error('expecting serializedJSON to be defined');
	}

	const [localValue, setLocalValue] = React.useState<State>(() => {
		return parseJSON(serializedJSON.serializedString, schema);
	});

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
		setLocalValue(parseJSON(localValue.str, schema));
	}, [localValue.str, schema]);

	const reset = useCallback(() => {
		setValue(defaultProps);
		setLocalValue(parseJSON(JSON.stringify(defaultProps, null, 2), schema));
	}, [defaultProps, schema, setValue]);

	const textAreaStyle: React.CSSProperties = useMemo(() => {
		if (!hasError) {
			return style;
		}

		return {
			...style,
			borderColor: FAIL_COLOR,
		};
	}, [hasError]);

	return (
		<div style={scrollable}>
			<RemTextarea
				onChange={onChange}
				onBlur={onQuickSave}
				value={localValue.str}
				status={localValue.validJSON ? 'ok' : 'error'}
				style={textAreaStyle}
			/>
			<Spacing y={1} />
			{localValue.validJSON === false ? (
				<ValidationMessage
					align="flex-start"
					message={localValue.error}
					type="error"
				/>
			) : localValue.zodValidation.success === false ? (
				<ZodErrorMessages
					zodValidationResult={localValue.zodValidation}
					viewTab="json"
				/>
			) : null}
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
