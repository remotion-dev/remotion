import '@remotion/promo-pages/dist/Homepage.css';
import {NewLanding} from '@remotion/promo-pages/dist/Homepage.js';
import '@remotion/promo-pages/dist/tailwind.css';
import Layout from '@theme/Layout';
import React, {useEffect, useState} from 'react';

if (
	typeof window !== 'undefined' &&
	window.location?.origin?.includes('convert.remotion.dev')
) {
	window.location.href = 'https://remotion.dev/convert';
}

const Inner: React.FC = () => {
	// Initialize with default values to avoid hydration mismatch
	const [colorMode, setColorModeState] = useState<'light' | 'dark'>('light');

	useEffect(() => {
		// After hydration, determine the actual color mode from DOM attributes
		const htmlElement = document.documentElement;
		const currentTheme = htmlElement.getAttribute('data-theme') as 'light' | 'dark' | null;
		if (currentTheme) {
			setColorModeState(currentTheme);
		}

		// Set up a MutationObserver to watch for theme changes
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
					const newTheme = (mutation.target as HTMLElement).getAttribute('data-theme') as 'light' | 'dark' | null;
					if (newTheme) {
						setColorModeState(newTheme);
					}
				}
			});
		});

		observer.observe(htmlElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		return () => observer.disconnect();
	}, []);

	const handleSetColorMode = (newColorMode: 'light' | 'dark') => {
		// Dispatch a custom event to trigger Docusaurus theme change
		const event = new CustomEvent('docusaurus-theme-change', {
			detail: { theme: newColorMode }
		});
		window.dispatchEvent(event);
		
		// Also try to find and click the actual theme toggle button
		const themeToggle = document.querySelector('[title="Switch between dark and light mode"]') as HTMLButtonElement;
		if (themeToggle && colorMode !== newColorMode) {
			themeToggle.click();
		}
	};

	return <NewLanding colorMode={colorMode} setColorMode={handleSetColorMode} />;
};

const Homepage: React.FC = () => {
	return (
		<Layout>
			<Inner />
		</Layout>
	);
};

export default Homepage;
