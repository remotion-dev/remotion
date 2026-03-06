import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {setUnsavedProps} from '../../../helpers/document-title';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../../Menu/is-menu-item';
import {deepEqual} from './deep-equal';
import type {RevisionContextType} from './local-state';
import {RevisionContext} from './local-state';
import {
	InvalidDefaultProps,
	InvalidSchema,
	TopLevelZodValue,
} from './SchemaErrorMessages';
import {defaultPropsEditorScrollableAreaRef} from './scroll-to-default-props-path';
import type {AnyZodSchema, ZodSafeParseResult} from './zod-schema-type';
import {getZodSchemaType, zodSafeParse} from './zod-schema-type';
import {ZodObjectEditor} from './ZodObjectEditor';

const scrollable: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	overflowY: 'auto',
};

export const SchemaEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly unsavedDefaultProps: Record<string, unknown>;
	readonly setValue: React.Dispatch<
		React.SetStateAction<Record<string, unknown>>
	>;
	readonly zodValidationResult: ZodSafeParseResult;
	readonly savedDefaultProps: Record<string, unknown>;
}> = ({
	schema,
	unsavedDefaultProps,
	setValue,
	zodValidationResult,
	savedDefaultProps,
}) => {
	const [revision, setRevision] = useState(0);

	const revisionState: RevisionContextType = useMemo(() => {
		return {
			childResetRevision: revision,
		};
	}, [revision]);

	useEffect(() => {
		const bumpRevision = () => {
			setRevision((old) => old + 1);
		};

		window.addEventListener(Internals.PROPS_UPDATED_EXTERNALLY, bumpRevision);

		return () => {
			window.removeEventListener(
				Internals.PROPS_UPDATED_EXTERNALLY,
				bumpRevision,
			);
		};
	}, []);

	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const hasChanged = useMemo(() => {
		return !deepEqual(savedDefaultProps, unsavedDefaultProps);
	}, [savedDefaultProps, unsavedDefaultProps]);

	useEffect(() => {
		setUnsavedProps(hasChanged);
	}, [hasChanged]);

	const typeName = getZodSchemaType(schema);

	const reset = useCallback(() => {
		setValue(savedDefaultProps);
	}, [savedDefaultProps, setValue]);

	if (!zodValidationResult.success) {
		const defaultPropsValid = zodSafeParse(schema, savedDefaultProps);

		if (!defaultPropsValid.success) {
			return <InvalidDefaultProps zodValidationResult={zodValidationResult} />;
		}

		return (
			<InvalidSchema reset={reset} zodValidationResult={zodValidationResult} />
		);
	}

	if (typeName !== 'object') {
		return <TopLevelZodValue typeReceived={typeName} />;
	}

	return (
		<div
			ref={defaultPropsEditorScrollableAreaRef}
			style={scrollable}
			className={VERTICAL_SCROLLBAR_CLASSNAME}
		>
			<RevisionContext.Provider value={revisionState}>
				<ZodObjectEditor
					discriminatedUnionReplacement={null}
					unsavedValue={unsavedDefaultProps as Record<string, unknown>}
					setValue={setValue}
					jsonPath={[]}
					schema={schema}
					savedValue={savedDefaultProps as Record<string, unknown>}
					onRemove={null}
					mayPad
				/>
			</RevisionContext.Provider>
		</div>
	);
};
