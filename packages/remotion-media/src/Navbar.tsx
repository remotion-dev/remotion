import {useRef, useState} from 'react';

export const Navbar = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuButton = useRef<HTMLButtonElement>(null);

	return (
		<nav
			aria-label="Main"
			className="relative z-10 flex min-h-[60px] flex-wrap items-center gap-x-2 bg-white px-4 text-[16px] font-medium text-[#1c1e21] shadow-[0_1px_2px_0_#0000001a] sm:gap-x-4"
			style={{
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
			}}
			onKeyDown={(event) => {
				if (event.key === 'Escape' && menuOpen) {
					setMenuOpen(false);
					menuButton.current?.focus();
				}
			}}
		>
			<button
				ref={menuButton}
				type="button"
				aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
				aria-expanded={menuOpen}
				aria-controls="primary-navigation-links"
				onClick={() => setMenuOpen((open) => !open)}
				className="-ml-2 flex size-10 cursor-pointer items-center justify-center rounded-md hover:bg-black/4 sm:hidden"
			>
				<svg
					aria-hidden="true"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path
						d={menuOpen ? 'M18 6 6 18M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
					/>
				</svg>
			</button>
			<a
				href="https://www.remotion.dev"
				aria-label="Remotion"
				className="inline-flex h-[60px] shrink-0 items-center sm:mr-2"
			>
				<img
					alt="Remotion logo"
					src="/remotion-wordmark.png"
					width={895}
					height={212}
					className="h-7 w-auto sm:h-8"
				/>
			</a>
			<div
				id="primary-navigation-links"
				className={`order-last w-full flex-col gap-1 border-t border-black/10 py-3 sm:order-none sm:flex sm:w-auto sm:flex-1 sm:flex-row sm:items-center sm:gap-0 sm:border-0 sm:py-0 ${menuOpen ? 'flex' : 'hidden'}`}
			>
				<a
					href="/"
					aria-current="page"
					onClick={() => setMenuOpen(false)}
					className="px-3 py-2 text-brand"
				>
					Test media
				</a>
				<a
					href="https://www.remotion.dev/docs"
					className="px-3 py-2 hover:text-brand sm:ml-auto"
				>
					Back to docs
				</a>
			</div>
		</nav>
	);
};
