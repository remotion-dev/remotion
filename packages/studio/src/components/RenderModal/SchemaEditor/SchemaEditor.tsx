import React from 'react';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../../Menu/is-menu-item';
import {getSchemaEditorRootInset} from './Fieldset';
import {TopLevelZodValue, type SchemaErrorMode} from './SchemaErrorMessages';
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
	scrollableContainer,
}: {
	readonly contentInset: number | undefined;
	readonly scrollableContainer: boolean;
}): React.CSSProperties => {
	const base = scrollableContainer ? scrollable : notScrollable;
	if (contentInset === undefined) {
		return base;
	}

	const rootInset = getSchemaEditorRootInset(contentInset);

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
	readonly contentInset?: number;
	readonly errorMode?: SchemaErrorMode;
}> = ({
	schema,
	value,
	setValue,
	scrollableContainer = true,
	contentInset,
	errorMode = 'full',
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const typeName = getZodSchemaType(schema);

	if (typeName !== 'object' && typeName !== 'discriminatedUnion') {
		return <TopLevelZodValue typeReceived={typeName} mode={errorMode} />;
	}

	const containerStyle = getContainerStyle({
		contentInset,
		scrollableContainer,
	});

	if (typeName === 'discriminatedUnion') {
		return (
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
		);
	}

	return (
		<div
			ref={defaultPropsEditorScrollableAreaRef}
			style={containerStyle}
			className={scrollableContainer ? VERTICAL_SCROLLBAR_CLASSNAME : undefined}
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
	);
};
