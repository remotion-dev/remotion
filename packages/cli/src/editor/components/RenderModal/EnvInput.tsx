import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import {RemotionInput} from '../NewComposition/RemInput';
import {input, optionRow} from './layout';

export const EnvInput: React.FC<{
	onEnvKeyChange: React.ChangeEventHandler<HTMLInputElement>;
	onEnvValChange: React.ChangeEventHandler<HTMLInputElement>;
	envKey: string | null;
	envVal: string | null;
}> = ({onEnvKeyChange, onEnvValChange, envKey, envVal}) => {
	const deleteEnv = () => {
		// TODO: implement function
	};

	console.log('helllo');
	return (
		<div style={{...optionRow, justifyContent: 'space-between'}}>
			<div>
				<RemotionInput
					status={'ok'}
					style={input}
					type="text"
					value={envKey as string}
					onChange={onEnvKeyChange}
				/>
			</div>
			<div>
				<RemotionInput
					status={'ok'}
					style={input}
					type="text"
					value={envVal as string}
					onChange={onEnvValChange}
				/>
			</div>
			{/* TODO: replace the remove with a svg */}
			<Button onClick={deleteEnv}>Remove </Button>
		</div>
	);
};
