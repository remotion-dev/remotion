import React from 'react';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../../Menu/is-menu-item';
import {getSchemaEditorFieldsetPadding} from './Fieldset';
import {
	SchemaEditorDensityContext,
	type SchemaEditorDensity,
} from './SchemaEditorDensity';
import {TopLevelZodValue} from './SchemaErrorMessages';
import {defaultPropsEditorScrollableAreaRef} from './scroll-to-default-props-path';
import type {AnyZodSchema} from './zod-schema-type';
import {getZodSchemaType} from './zod-schema-type';
import {ZodDiscriminatedUnionEditor} from './ZodDiscriminatedUnionEditor';
import {ZodObjectEditor} from './ZodObjectEditor';
import type {UpdaterFunction} from './ZodSwitch';

const scrollable: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	overflowY: 'auto',
};

const notScrollable: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
};

const getContainerStyle = ({
	contentInset,
	density,
	scrollableContainer,
}: {
	readonly contentInset: number | undefined;
	readonly density: SchemaEditorDensity;
	readonly scrollableContainer: boolean;
}): React.CSSProperties => {
	const base = scrollableContainer ? scrollable : notScrollable;
	if (contentInset === undefined) {
		return base;
	}

	const fieldsetPadding = getSchemaEditorFieldsetPadding(density);
	const rootInset = Math.max(0, contentInset - fieldsetPadding);

	return {
		...base,
		boxSizing: 'border-box',
		paddingLeft: rootInset,
		paddingRight: rootInset,
	};
};

export const SchemaEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly value: Record<string, unknown>;
	readonly setValue: UpdaterFunction<Record<string, unknown>>;
	readonly scrollableContainer?: boolean;
	readonly density?: SchemaEditorDensity;
	readonly contentInset?: number;
}> = ({
	schema,
	value,
	setValue,
	scrollableContainer = true,
	density = 'default',
	contentInset,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const typeName = getZodSchemaType(schema);

	if (typeName !== 'object' && typeName !== 'discriminatedUnion') {
		return <TopLevelZodValue typeReceived={typeName} />;
	}

	const containerStyle = getContainerStyle({
		contentInset,
		density,
		scrollableContainer,
	});

	if (typeName === 'discriminatedUnion') {
		return (
			<SchemaEditorDensityContext.Provider value={density}>
				<div
					ref={defaultPropsEditorScrollableAreaRef}
					style={containerStyle}
					className={
						scrollableContainer ? VERTICAL_SCROLLBAR_CLASSNAME : undefined
					}
				>
					<ZodDiscriminatedUnionEditor
						schema={schema}
						setValue={setValue}
						value={value}
						mayPad
						jsonPath={[]}
						onRemove={null}
					/>
				</div>
			</SchemaEditorDensityContext.Provider>
		);
	}

	return (
		<SchemaEditorDensityContext.Provider value={density}>
			<div
				ref={defaultPropsEditorScrollableAreaRef}
				style={containerStyle}
				className={
					scrollableContainer ? VERTICAL_SCROLLBAR_CLASSNAME : undefined
				}
			>
				<ZodObjectEditor
					discriminatedUnionReplacement={null}
					value={value as Record<string, unknown>}
					setValue={setValue}
					jsonPath={[]}
					schema={schema}
					onRemove={null}
					mayPad
				/>
			</div>
		</SchemaEditorDensityContext.Provider>
	);
};
