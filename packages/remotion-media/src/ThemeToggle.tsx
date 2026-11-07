import {useEffect, useState} from 'react';

export const ThemeToggle = () => {
	const [choice, setChoice] = useState<'light' | 'dark' | null>(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const sync = () => {
			let saved: string | null = null;
			try {
				saved = localStorage.getItem('theme');
			} catch {
				// System preference still works when storage is unavailable.
			}

			const nextChoice =
				saved === null || saved === 'system'
					? null
					: saved === 'dark'
						? 'dark'
						: 'light';
			const next =
				nextChoice === 'dark' || (nextChoice === null && media.matches);
			document.documentElement.dataset.theme = next ? 'dark' : 'light';
			document.documentElement.dataset.themeChoice = nextChoice ?? 'system';
			setChoice(nextChoice);
			setReady(true);
		};

		sync();
		media.addEventListener('change', sync);
		window.addEventListener('storage', sync);
		return () => {
			media.removeEventListener('change', sync);
			window.removeEventListener('storage', sync);
		};
	}, []);

	return (
		<button
			type="button"
			aria-label={`Switch between dark and light mode (currently ${choice ?? 'system'} mode)`}
			title={`${choice ?? 'system'} mode`}
			disabled={!ready}
			className="ml-auto flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-black/4 dark:hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:ml-0"
			onClick={() => {
				// Match Docusaurus: system → light → dark → system.
				const nextChoice =
					choice === null ? 'light' : choice === 'light' ? 'dark' : null;
				const next =
					nextChoice === 'dark' ||
					(nextChoice === null &&
						window.matchMedia('(prefers-color-scheme: dark)').matches);
				document.documentElement.dataset.theme = next ? 'dark' : 'light';
				document.documentElement.dataset.themeChoice = nextChoice ?? 'system';
				setChoice(nextChoice);
				try {
					if (nextChoice === null) {
						localStorage.removeItem('theme');
					} else {
						localStorage.setItem('theme', nextChoice);
					}
				} catch {
					// Keep the toggle usable when storage is unavailable.
				}
			}}
		>
			<svg
				aria-hidden="true"
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<g className="hidden [[data-theme-choice=light]_&]:block">
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
				</g>
				<path
					className="hidden [[data-theme-choice=dark]_&]:block"
					d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"
				/>
				<g className="hidden [[data-theme-choice=system]_&]:block">
					<circle cx="12" cy="12" r="9" />
					<path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none" />
				</g>
			</svg>
		</button>
	);
};
