import {useHistory} from '@docusaurus/router';
import type {WrapperProps} from '@docusaurus/types';
import '@remotion/promo-pages/dist/tailwind.css';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import {useCrawlChatSidePanel} from 'crawlchat-client';
import React, {type ReactNode, useEffect} from 'react';

type Props = WrapperProps<typeof LayoutType>;

const LayoutWrapper = (props: Props): ReactNode => {
	useCrawlChatSidePanel({history: useHistory()});

	useEffect(() => {
		// Try multiple possible selectors for CrawlChat side panel
		const possibleSelectors = [
			'#crawlchat-sidepanel',
			'[id*="crawlchat"]',
			'[class*="crawlchat-sidepanel"]',
			'[class*="crawlchat-panel"]',
			'iframe[src*="crawlchat"]',
		];

		const findSidePanel = (): HTMLElement | null => {
			for (const selector of possibleSelectors) {
				const element = document.querySelector(selector) as HTMLElement | null;
				if (element) return element;
			}

			return null;
		};

		const checkIfOpen = (element: HTMLElement | null): boolean => {
			if (!element) return false;

			const style = window.getComputedStyle(element);
			const rect = element.getBoundingClientRect();

			// Check multiple conditions to determine if panel is open
			const isDisplayed = style.display !== 'none';
			const isVisible = style.visibility !== 'hidden';
			const hasWidth = rect.width > 0;
			const hasOpacity = parseFloat(style.opacity || '1') > 0;

			// Also check for common "open" class patterns
			const hasOpenClass =
				element.classList.contains('open') ||
				element.classList.contains('is-open') ||
				element.classList.contains('active');

			return (
				(isDisplayed && isVisible && hasWidth && hasOpacity) || hasOpenClass
			);
		};

		const toggleBodyClass = () => {
			const sidePanel = findSidePanel();
			if (checkIfOpen(sidePanel)) {
				document.body.classList.add('crawlchat-open');
			} else {
				document.body.classList.remove('crawlchat-open');
			}
		};

		// Initial check with delay to ensure DOM is ready
		setTimeout(toggleBodyClass, 100);
		setTimeout(toggleBodyClass, 500);
		setTimeout(toggleBodyClass, 1000);

		// Create observer
		const observer = new MutationObserver(() => {
			// Debounce the toggle to avoid excessive calls
			clearTimeout((window as any).__crawlchatToggleTimeout);
			(window as any).__crawlchatToggleTimeout = setTimeout(
				toggleBodyClass,
				50,
			);
		});

		// Observe the entire body for changes
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['class', 'style'],
		});

		// Also listen for resize events (in case panel slides in)
		const resizeHandler = () => toggleBodyClass();
		window.addEventListener('resize', resizeHandler);

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', resizeHandler);
			clearTimeout((window as any).__crawlchatToggleTimeout);
		};
	}, []);

	return <Layout {...props} />;
};

export default LayoutWrapper;
