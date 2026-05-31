import {useColorMode} from '@docusaurus/theme-common';
import {Player} from '@remotion/player';
import React, {useCallback, useMemo, useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {
	fillSchemaDefaults,
	getActiveSchemaFields,
	getInitialValuesFromSchema,
} from './get-default-props-from-schema';
import {effectsDemos} from './registry';
import {SchemaControl} from './schema-control';
import styles from '../demos/styles.module.css';

const container: React.CSSProperties = {
	overflow: 'hidden',
	width: '100%',
	border: '1px solid var(--ifm-color-emphasis-300)',
	borderRadius: 'var(--ifm-pre-border-radius)',
	marginBottom: 40,
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

	const [state, setState] = useState<Record<string, unknown>>(() => initialState);

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
