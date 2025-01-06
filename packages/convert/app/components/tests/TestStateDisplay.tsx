import {formatSeconds} from '~/lib/format-seconds';
import type {TestState} from '~/tests/test-structure';
import {ErrorState} from '../ErrorState';

export const TestStateDisplay: React.FC<{
	testState: TestState;
}> = ({testState}) => {
	if (testState.type === 'succeeded') {
		return (
			<div className="text-green-700 text-sm font-bold">
				Succeeded in {testState.timeInMilliseconds}ms
			</div>
		);
	}

	if (testState.type === 'failed') {
		return (
			<div className="text-red-500 text-sm w-full font-bold overflow-x-hidden">
				<ErrorState error={testState.error} />
			</div>
		);
	}

	if (testState.type === 'running') {
		if (testState.state) {
			return (
				<div className="text-sm">
					{formatSeconds(testState.state.millisecondsWritten / 1000)}
				</div>
			);
		}

		return <div className="text-sm">Running...</div>;
	}

	return null;
};
