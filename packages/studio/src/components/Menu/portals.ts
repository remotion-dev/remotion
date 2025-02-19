export const portals = [
	document.getElementById('menuportal-0') as Element,
	document.getElementById('menuportal-1') as Element,
	document.getElementById('menuportal-2') as Element,
	document.getElementById('menuportal-3') as Element,
	document.getElementById('menuportal-4') as Element,
	document.getElementById('menuportal-5') as Element,
];

export const getPortal = (i: number) => {
	return portals[i];
};
