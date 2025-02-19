import React, {useCallback} from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {Button} from '../Button';
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

export const RenderModalEnvironmentVariables: React.FC<{
	readonly envVariables: [string, string][];
	readonly setEnvVariables: React.Dispatch<
		React.SetStateAction<[string, string][]>
	>;
}> = ({envVariables, setEnvVariables}) => {
	const onEnvValChange = useCallback(
		(index: number, value: string) => {
			setEnvVariables((oldEnv) => {
				const newEnv = [...oldEnv];
				newEnv[index][1] = value;
				return newEnv;
			});
		},
		[setEnvVariables],
	);

	const onEnvKeyChange = useCallback(
		(index: number, value: string) => {
			setEnvVariables((oldEnv) => {
				const newEnv = [...oldEnv];
				newEnv[index][0] = value;
				return newEnv;
			});
		},
		[setEnvVariables],
	);

	const onDelete = useCallback(
		(index: number) => {
			setEnvVariables((oldEnv) => oldEnv.filter((_, idx) => idx !== index));
		},
		[setEnvVariables],
	);

	const addField = useCallback(() => {
		setEnvVariables((oldEnv) => [...oldEnv, ['', '']]);
	}, [setEnvVariables]);

	const usedKeys: string[] = [];

	return (
		<div style={container}>
			<strong style={title}>Environment variables</strong>
			{envVariables.map((env, i) => {
				let isDuplicate = false;

				if (usedKeys.includes(env[0].toUpperCase())) {
					isDuplicate = true;
				}

				usedKeys.push(env[0].toUpperCase());

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
						isDuplicate={isDuplicate}
						autoFocus={i === envVariables.length - 1 && env[0] === ''}
					/>
				);
			})}
			<Spacing y={1} block />
			<Button style={button} onClick={addField}>
				+ Add env variable
			</Button>
			<Spacing y={1} block />
		</div>
	);
};
