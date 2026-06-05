const portalIds = [
	'menuportal-0',
	'menuportal-1',
	'menuportal-2',
	'menuportal-3',
	'menuportal-4',
	'menuportal-5',
];

export const portals: Element[] =
	typeof document === 'undefined'
		? []
		: portalIds.map((id) => document.getElementById(id) as Element);

export const getPortal = (i: number) => {
	const portal = portals[i];
	if (!portal) {
		throw new Error(`Expected menu portal ${i} to exist`);
	}

	return portal;
};
