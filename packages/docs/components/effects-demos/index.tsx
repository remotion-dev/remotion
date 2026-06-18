import {useColorMode} from '@docusaurus/theme-common';
import {Player} from '@remotion/player';
import React, {useCallback, useMemo, useState} from 'react';
import {AbsoluteFill} from 'remotion';
import styles from '../demos/styles.module.css';
import {
	makeEffectDragData,
	setEffectDragData,
	setEffectDragImage,
} from './effect-drag-data';
import {
	fillSchemaDefaults,
	getActiveSchemaFields,
	getInitialValuesFromSchema,
} from './get-default-props-from-schema';
import {effectsDemos} from './registry';
import {SchemaControl} from './schema-control';

const container: React.CSSProperties = {
	overflow: 'hidden',
	width: '100%',
	border: '1px solid var(--ifm-color-emphasis-300)',
	borderRadius: 'var(--ifm-pre-border-radius)',
	marginBottom: 40,
};

const dragHandle: React.CSSProperties = {
	alignItems: 'center',
	borderBottom: '1px solid var(--ifm-color-emphasis-300)',
	cursor: 'grab',
	display: 'flex',
	fontSize: 13,
	fontWeight: 600,
	gap: 6,
	padding: '8px 10px',
	userSelect: 'none',
};

export const EffectsDemo: React.FC<{
	readonly type: string;
}> = ({type}) => {
	const demo = effectsDemos.find((d) => d.id === type);
	if (!demo) {
		throw new Error('Effects demo not found');
	}

	const {colorMode} = useColorMode();
	const [key, setKey] = useState(() => 0);

	const initialState = useMemo(() => {
		return getInitialValuesFromSchema({
			schema: demo.schema,
			initialValues: demo.initialValues,
		});
	}, [demo.initialValues, demo.schema]);

	const [state, setState] = useState<Record<string, unknown>>(
		() => initialState,
	);

	const activeFields = useMemo(() => {
		return getActiveSchemaFields({
			schema: demo.schema,
			values: state,
		});
	}, [demo.schema, state]);

	const restart = useCallback(() => {
		setState(initialState);
		setKey((k) => k + 1);
	}, [initialState]);

	const dragData = useMemo(() => {
		return makeEffectDragData({
			effectName: demo.effectName,
			effectImportPath: demo.effectImportPath,
			effectConfig: state,
		});
	}, [demo.effectImportPath, demo.effectName, state]);

	const onDragStart = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			setEffectDragData({dataTransfer: e.dataTransfer, dragData});
			setEffectDragImage(e.dataTransfer);
		},
		[dragData],
	);

	return (
		<div style={container}>
			<Player
				key={key}
				acknowledgeRemotionLicense
				component={demo.comp}
				compositionWidth={demo.compWidth}
				compositionHeight={demo.compHeight}
				durationInFrames={demo.durationInFrames}
				fps={demo.fps}
				style={{
					width: '100%',
					aspectRatio: demo.compWidth / demo.compHeight,
					borderBottom:
						activeFields.length > 0
							? '1px solid var(--ifm-color-emphasis-300)'
							: 0,
				}}
				logLevel={demo.logLevel}
				errorFallback={({error}) => {
					return (
						<AbsoluteFill
							style={{
								justifyContent: 'center',
								alignItems: 'center',
								fontSize: 30,
								textAlign: 'center',
								lineHeight: 1.5,
							}}
						>
							{error.message}
							<br />
							<button
								style={{
									fontSize: 30,
								}}
								onClick={restart}
								type="button"
							>
								Restart
							</button>
						</AbsoluteFill>
					);
				}}
				inputProps={{...state, darkMode: colorMode === 'dark'}}
				autoPlay={demo.autoPlay}
				controls={demo.controls}
				initiallyMuted
				loop
			/>
			<div
				draggable
				onDragStart={onDragStart}
				style={dragHandle}
				title="Drag this effect into Remotion Studio"
			>
				<span aria-hidden="true">::</span>
				<span>Drag current effect onto a layer in the Studio</span>
			</div>
			<div className={styles.containerrow}>
				{activeFields.map(([fieldKey, field]) => {
					return (
						<SchemaControl
							key={fieldKey}
							fieldKey={fieldKey}
							field={field}
							value={state[fieldKey]}
							setValue={(value) => {
								setState((previousState) => {
									return fillSchemaDefaults({
										schema: demo.schema,
										values: {
											...previousState,
											[fieldKey]: value,
										},
									});
								});
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};
