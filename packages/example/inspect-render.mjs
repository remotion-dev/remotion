import {getRenderProgress} from '@remotion/lambda/client';
import {RenderInternals} from '@remotion/renderer';
import {CliInternals} from '@remotion/cli';

const progress = await getRenderProgress({
	renderId: 'hsrxu7hby4',
	bucketName: 'remotionlambda-gc1w0xbfzl',
	functionName: 'remotion-render-4-0-11-mem2048mb-disk2048mb-420sec',
	region: 'eu-central-1',
});

console.log(progress);

const err = progress.errors[0];

const frames = RenderInternals.parseStack(err.stack.split('\n'));

const errorWithStackFrame = new RenderInternals.SymbolicateableError({
	message: err.message,
	frame: err.frame,
	name: err.name,
	stack: err.stack,
	stackFrame: frames,
});

await CliInternals.printError(errorWithStackFrame, 'info');
