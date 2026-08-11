import {pageRef} from '../Page';

export function preventBodyScroll() {
	const {overflow} = document.body.style;
	if (!pageRef.current) {
		throw new Error('Page ref not found');
	}

	const pageElement = pageRef.current;

	document.body.style.overflow = 'hidden';
	pageElement.style.overflow = 'hidden';
	return () => {
		document.body.style.overflow = overflow;
		pageElement.style.overflow = overflow;
	};
}
