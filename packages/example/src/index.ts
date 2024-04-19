import {LoadSkia} from '@shopify/react-native-skia/src/web';
import {registerRoot} from 'remotion';

// Should be able to defer registerRoot()
(async () => {
	await LoadSkia();
	const {Index} = await import('./Root');
	registerRoot(Index);
})();
