// Needs to be in sync with packages/lambda/src/functions/helpers/lifecycle.ts
type Value = '1-day' | '3-days' | '7-days' | '30-days';

let renderFolderExpiry: Value | null = null;

export const getRenderFolderExpiry = () => {
	return renderFolderExpiry;
};

export const setRenderFolderExpiry = (day: Value | null) => {
	renderFolderExpiry = day;
};
