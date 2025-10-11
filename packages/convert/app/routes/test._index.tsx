import React from 'react';
import {RunAll} from '~/components/tests/RunAll';
import {testList} from '~/tests/test-list';
import {TestComponent} from '~/tests/TestComponent';

const TestSuite: React.FC = () => {
	return (
		<div className="bg-slate-50 min-h-screen w-screen">
			<div className="w-full max-w-[900px] pt-16 m-auto gap-4 flex flex-col px-5 pb-20">
				<RunAll tests={testList} />
				{testList.map((t) => {
					return <TestComponent key={t.name} test={t} />;
				})}
			</div>
		</div>
	);
};

export default TestSuite;
