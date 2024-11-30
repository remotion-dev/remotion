import React from 'react';
import {RunAll} from '~/components/tests/RunAll';
import {runBigBuckBunny, runBigBuckBunny2} from '~/tests/test-list';
import {TestStructure} from '~/tests/test-structure';
import {TestComponent} from '~/tests/TestComponent';

const tests: TestStructure[] = [runBigBuckBunny(), runBigBuckBunny2()];

const TestSuite: React.FC = () => {
	return (
		<div className="bg-slate-50 min-h-screen w-screen">
			<div className="w-full max-w-[900px] pt-16 m-auto gap-4 flex flex-col px-5">
				<RunAll tests={tests} />
				{tests.map((t) => {
					return <TestComponent key={t.name} test={t} />;
				})}
			</div>
		</div>
	);
};

export default TestSuite;
