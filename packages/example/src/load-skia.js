export const loadSkia = async () => {
	const {LoadSkia} = await import('@shopify/react-native-skia/src/web');
	return LoadSkia();
};
