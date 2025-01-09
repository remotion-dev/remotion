import {Link} from '@remix-run/react';
import React from 'react';
import {TestStateDisplay} from '~/components/tests/TestStateDisplay';
import {Button} from '~/components/ui/button';
import type {TestStructure} from './test-structure';
import { useTest} from './test-structure';

export const TestComponent: React.FC<{
	readonly test: TestStructure;
}> = ({test}) => {
	const {state, run} = useTest(test);

	return (
		<div className="border-black rounded border-2 p-4 bg-white">
			<div className="flex flex-row">
				<div>
					<div className="font-brand font-bold text-xl">
						{test.name}{' '}
						<Link
							className="text-brand font-brand text-sm font-medium"
							to={`/convert?url=${encodeURIComponent(test.src)}`}
						>
							Try in UI
						</Link>
					</div>
					<div className="w-full overflow-x-auto">
						<TestStateDisplay testState={state} />
					</div>
				</div>
				<div className="flex-1" />
				{state.type === 'not-run' ? (
					<Button onClick={run}>Run test</Button>
				) : null}
			</div>
		</div>
	);
};
