import {useColorMode} from '@docusaurus/theme-common';
import {Player} from '@remotion/player';
import React, {useCallback, useMemo, useState} from 'react';
import {AbsoluteFill} from 'remotion';
import controlStyles from '../demos/styles.module.css';
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
import styles from './styles.module.css';

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
		<div className={styles.container}>
			<div className={styles.preview}>
				<div
					className={styles.playerShell}
					style={{
						borderBottom:
							activeFields.length > 0
								? '1px solid var(--ifm-color-emphasis-300)'
								: 0,
					}}
				>
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
				</div>
				<div
					draggable
					onDragStart={onDragStart}
					className={styles.dragHandle}
					title="Drag this effect into Remotion Studio"
				>
					<span aria-hidden="true">::</span>
					<span>Drag current effect onto a layer in the Studio</span>
				</div>
			</div>
			<div className={`${controlStyles.containerrow} ${styles.controls}`}>
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
