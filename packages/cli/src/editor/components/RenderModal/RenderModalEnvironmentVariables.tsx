import {useCallback} from 'react';
import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import {EnvInput} from './EnvInput';

// TODO: should warn if XOR key XOR value is empty
// TODO: Should warn if trying to set the same key twice
// TODO: Should warn if trying to set NODE_ENV
// TODO: Add a title
// TODO: Hide env variables by default
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
		<div>
			{envVariables.map((env, i) => {
				return (
					<EnvInput
						key={env[0]}
						onEnvKeyChange={onEnvKeyChange}
						onEnvValChange={onEnvValChange}
						envKey={env[0]}
						envVal={env[1]}
						onDelete={onDelete}
						index={i}
					/>
				);
			})}
			<Button onClick={addField}>+ Add</Button>
		</div>
	);
};
