import type {Dispatch, SetStateAction} from 'react';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {AnyZodObject, ZodError} from 'zod';
import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import {useKeybinding} from '../../helpers/use-keybinding';
import {Row, Spacing} from '../layout';
import {RemTextarea} from '../NewComposition/RemTextarea';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import type {State} from './RenderModalData';
import type {SerializedJSONWithCustomFields} from './SchemaEditor/input-props-serialization';
import {InvalidSchema} from './SchemaEditor/SchemaErrorMessages';

const style: React.CSSProperties = {
	fontFamily: 'monospace',
	flex: 1,
};

const schemaButton: React.CSSProperties = {
	border: 'none',
	padding: 0,
	display: 'inline-block',
	cursor: 'pointer',
	backgroundColor: 'transparent',
};

const scrollable: React.CSSProperties = {
	padding: '8px 12px',
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
};

export type EditType = 'inputProps' | 'defaultProps';

export const RenderModalJSONPropsEditor: React.FC<{
	value: unknown;
	setValue: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
	zodValidationResult: Zod.SafeParseReturnType<unknown, unknown>;
	switchToSchema: () => void;
	onSave: () => void;
	valBeforeSafe: unknown;
	showSaveButton: boolean;
	parseJSON: (str: string) => State;
	serializedJSON: SerializedJSONWithCustomFields | null;
	schema: AnyZodObject;
	defaultProps: Record<string, unknown>;
	setLocalJsonEditorValue: Dispatch<SetStateAction<State | null>>;
	localJsonEditorValue: State | null;
}> = ({
	setValue,
	value,
	zodValidationResult,
	switchToSchema,
	onSave,
	valBeforeSafe,
	showSaveButton,
	parseJSON,
	serializedJSON,
	schema,
	defaultProps,
	setLocalJsonEditorValue,
	localJsonEditorValue,
}) => {
	if (serializedJSON === null) {
		throw new Error('expecting serializedJSON to be defined');
	}

	if (localJsonEditorValue === null) {
		throw new Error('expecting localJsonEditorValue to be defined');
	}

	const keybindings = useKeybinding();

	const [zodError, setZodError] = useState<ZodError | null>(null);

	const [localValidationResult, setLocalValidationResult] = useState<any>(null);

	const onPretty = useCallback(() => {
		if (!localJsonEditorValue.validJSON) {
			return;
		}

		const parsed = JSON.parse(localJsonEditorValue.str);
		setLocalJsonEditorValue({
			...localJsonEditorValue,
			str: JSON.stringify(parsed, null, 2),
		});
	}, [localJsonEditorValue, setLocalJsonEditorValue]);

	const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
		(e) => {
			const parsed = parseJSON(e.target.value);

			if (parsed.validJSON) {
				setLocalJsonEditorValue({
					str: e.target.value,
					value: parsed.value,
					validJSON: parsed.validJSON,
				});
			} else {
				setLocalJsonEditorValue({
					str: e.target.value,
					validJSON: parsed.validJSON,
					error: parsed.error,
				});
			}

			if (parsed.validJSON) {
				const isValidZod = schema.safeParse(parsed.value);
				setLocalValidationResult(isValidZod);
				if (isValidZod.success) {
					setZodError(null);
					setValue(parsed.value);
				} else {
					setZodError(isValidZod.error);
				}
			}
		},
		[parseJSON, schema, setLocalJsonEditorValue, setValue]
	);

	const hasChanged = useMemo(() => {
		return value && JSON.stringify(value) !== JSON.stringify(valBeforeSafe);
	}, [valBeforeSafe, value]);

	const reset = useCallback(() => {
		setValue(defaultProps);
	}, [defaultProps, setValue]);

	const onQuickSave = useCallback(() => {
		if (hasChanged) {
			onSave();
		}
	}, [hasChanged, onSave]);

	useEffect(() => {
		const save = keybindings.registerKeybinding({
			event: 'keydown',
			key: 's',
			commandCtrlKey: true,
			callback: onQuickSave,
			preventDefault: true,
			triggerIfInputFieldFocused: true,
		});

		return () => {
			save.unregister();
		};
	}, [keybindings, onQuickSave, onSave]);

	return (
		<div style={scrollable}>
			<RemTextarea
				onChange={onChange}
				value={localJsonEditorValue.str}
				status={localJsonEditorValue.validJSON ? 'ok' : 'error'}
				style={style}
			/>
			<Spacing y={1} />
			{localJsonEditorValue.validJSON === false ? (
				<ValidationMessage
					align="flex-start"
					message={localJsonEditorValue.error}
					type="error"
				/>
			) : zodError ? (
				<button type="button" style={schemaButton} onClick={switchToSchema}>
					<InvalidSchema
						reset={reset}
						zodValidationResult={localValidationResult}
					/>
					<ValidationMessage
						align="flex-start"
						message="Does not match schema"
						type="warning"
					/>
				</button>
			) : null}
			<Spacing y={1} />
			<Row>
				<Button disabled={!localJsonEditorValue.validJSON} onClick={onPretty}>
					Format JSON
				</Button>
				<Spacing x={1} />
				<Button
					onClick={onSave}
					disabled={
						!zodValidationResult.success || !hasChanged || !showSaveButton
					}
				>
					Save
				</Button>
			</Row>
		</div>
	);
};
