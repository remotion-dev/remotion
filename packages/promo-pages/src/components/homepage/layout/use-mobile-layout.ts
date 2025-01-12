import {useElementSize} from './use-el-size';

export const useMobileLayout = () => {
	const containerSize = useElementSize(
		typeof document === 'undefined' ? null : document.body,
	);
	return (containerSize?.width ?? Infinity) < 900;
};
