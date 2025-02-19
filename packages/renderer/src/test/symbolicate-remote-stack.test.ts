import {expect, test} from 'bun:test';
import {parseStack} from '../parse-browser-error-stack';

const stack = `Error: Evaluation failed: TypeError: Cannot read properties of undefined (reading 'a')
at Index (https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js:60509:46)
at Ch (https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js:7079:137)
at ck (https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js:7189:460)
at bk (https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js:7172:347)
at ak (https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js:7172:278)
at Tj (https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js:7172:138)
at Lj (https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js:7165:163)
at Jg (https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js:7159:175)
at lk (https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js:7207:27)
at https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js:7211:301
at ExecutionContext._evaluateInternal (/var/task/index.js:37957:17)
at processTicksAndRejections (internal/process/task_queues.js:95:5)
at async ExecutionContext.evaluate (/var/task/index.js:37902:16)
at async innerGetCompositions (/var/task/index.js:76354:7)`;

test('Should parse Lambda stack correctly', () => {
	const st = parseStack(stack.split('\n'));

	expect(st).toEqual([
		{
			columnNumber: 46,
			fileName:
				'https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js',
			functionName: 'Index',
			lineNumber: 60509,
		},
		{
			columnNumber: 137,
			fileName:
				'https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js',
			functionName: 'Ch',
			lineNumber: 7079,
		},
		{
			columnNumber: 460,
			fileName:
				'https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js',
			functionName: 'ck',
			lineNumber: 7189,
		},
		{
			columnNumber: 347,
			fileName:
				'https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js',
			functionName: 'bk',
			lineNumber: 7172,
		},
		{
			columnNumber: 278,
			fileName:
				'https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js',
			functionName: 'ak',
			lineNumber: 7172,
		},
		{
			columnNumber: 138,
			fileName:
				'https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js',
			functionName: 'Tj',
			lineNumber: 7172,
		},
		{
			columnNumber: 163,
			fileName:
				'https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js',
			functionName: 'Lj',
			lineNumber: 7165,
		},
		{
			columnNumber: 175,
			fileName:
				'https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js',
			functionName: 'Jg',
			lineNumber: 7159,
		},
		{
			columnNumber: 27,
			fileName:
				'https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js',
			functionName: 'lk',
			lineNumber: 7207,
		},
		{
			columnNumber: 301,
			fileName:
				'https://remotionlambda-sd60tlwje7.s3.us-east-1.amazonaws.com/sites/testbed/bundle.js',
			functionName: null,
			lineNumber: 7211,
		},
		{
			columnNumber: 17,
			fileName: '/var/task/index.js',
			functionName: 'ExecutionContext._evaluateInternal',
			lineNumber: 37957,
		},
		{
			columnNumber: 5,
			fileName: 'internal/process/task_queues.js',
			functionName: 'processTicksAndRejections',
			lineNumber: 95,
		},
		{
			columnNumber: 16,
			fileName: '/var/task/index.js',
			functionName: 'async ExecutionContext.evaluate',
			lineNumber: 37902,
		},
		{
			columnNumber: 7,
			fileName: '/var/task/index.js',
			functionName: 'async innerGetCompositions',
			lineNumber: 76354,
		},
	]);
});
