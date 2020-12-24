import {render} from '@remotion/cli';
import {evaluateRootForCompositions} from 'remotion';
import xns from 'xns';

xns(async () => {
	await import('./src/index');
	const comps = await evaluateRootForCompositions();
	return render(require.resolve('./src/index'), comps);
});
