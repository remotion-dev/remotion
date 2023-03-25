import React, {useCallback} from 'react';
import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import {LIGHT_TEXT} from '../../helpers/colors';
import {Spacing} from '../layout';
import {EnvInput} from './EnvInput';

const title: React.CSSProperties = {
	fontSize: 14,
	fontWeight: 'bold',
	color: LIGHT_TEXT,
	marginLeft: 16,
};

const container: React.CSSProperties = {
	marginTop: 20,
};

const button: React.CSSProperties = {
	marginLeft: 16,
};

// TODO: should warn if XOR key XOR value is empty
// TODO: Should warn if trying to set the same key twice
// TODO: Should warn if trying to set NODE_ENV
export const RenderModalEnvironmentVariables: React.FC<{
	envVariables: [string, string][];
	setEnvVariables: React.Dispatch<React.SetStateAction<[string, string][]>>;
}> = ({envVariables, setEnvVariables}) => {
	const onEnvValChange = useCallback(
		(index: number, value: string) => {
			setEnvVariables((oldEnv) => {
				const newEnv = [...oldEnv];
				newEnv[index][1] = value;
				return newEnv;
			});
		},
		[setEnvVariables]
	);

	const onEnvKeyChange = useCallback(
		(index: number, value: string) => {
			setEnvVariables((oldEnv) => {
				const newEnv = [...oldEnv];
				newEnv[index][0] = value;
				return newEnv;
			});
		},
		[setEnvVariables]
	);

	const onDelete = useCallback(
		(index: number) => {
			setEnvVariables((oldEnv) => oldEnv.filter((_, idx) => idx !== index));
		},
		[setEnvVariables]
	);

	const addField = useCallback(() => {
		setEnvVariables((oldEnv) => [...oldEnv, ['', '']]);
	}, [setEnvVariables]);

	return (
		<div style={container}>
			<strong style={title}>Environment variables</strong>
			{envVariables.map((env, i) => {
				return (
					<EnvInput
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						onEnvKeyChange={onEnvKeyChange}
						onEnvValChange={onEnvValChange}
						envKey={env[0]}
						envVal={env[1]}
						onDelete={onDelete}
						index={i}
						autoFocus={i === envVariables.length - 1 && env[0] === ''}
					/>
				);
			})}
			<Spacing y={1} block />
			<Button style={button} onClick={addField}>
				+ Add env variable
			</Button>
		</div>
	);
};
