import {useCallback} from 'react';
import type {TestStructure} from '~/tests/test-structure';
import {Button} from '../ui/button';

export const RunAll: React.FC<{
	tests: TestStructure[];
}> = ({tests}) => {
	const runTests = useCallback(async () => {
		for (const test of tests) {
			await test.run();
		}
	}, [tests]);

	return (
		<div className="flex flex-row items-center justify-center font-bold font-brand">
			<div className="text-2xl">@remotion/webcodecs Tests</div>
			<div className="flex-1" />
			<Button onClick={runTests}>Run all</Button>
		</div>
	);
};
