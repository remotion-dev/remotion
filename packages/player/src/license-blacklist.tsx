import React, {useEffect} from 'react';

export const getHashOfDomain = async (): Promise<string | null> => {
	if (typeof window === 'undefined') {
		return null;
	}

	if (typeof window.crypto === 'undefined') {
		return null;
	}

	if (typeof window.crypto.subtle === 'undefined') {
		return null;
	}

	try {
		const hashBuffer = await crypto.subtle.digest(
			'SHA-256',
			new TextEncoder().encode(window.location.hostname),
		);

		return Array.from(new Uint8Array(hashBuffer))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
	} catch {
		return null;
	}
};

const style: React.CSSProperties = {
	backgroundColor: 'red',
	position: 'absolute',
	padding: 12,
	fontFamily: 'Arial',
};

const DOMAIN_BLACKLIST = [
	'28d262b44cc61fa750f1686b16ad0604dabfe193fbc263eec05c89b7ad4c2cd6',
	'4db1b0a94be33165dfefcb3ba03d04c7a2666dd27c496d3dc9fa41858e94925e',
	'fbc48530bbf245da790f63675e84e06bab38c3b114fab07eb350025119922bdc',
	'7baf10a8932757b1b3a22b3fce10a048747ac2f8eaf638603487e3705b07eb83',
	'8a6c21a598d8c667272b5207c051b85997bf5b45d5fb712378be3f27cd72c6a6',
	'a2f7aaac9c50a9255e7fc376110c4e0bfe153722dc66ed3c5d3bf2a135f65518',
];

let ran = false;

export const RenderWarningIfBlacklist: React.FC = () => {
	const [unlicensed, setUnlicensed] = React.useState(false);

	useEffect(() => {
		// Prevent firing twice in strict mode
		if (ran) {
			return;
		}

		ran = true;
		getHashOfDomain()
			.then((hash) => {
				if (hash && DOMAIN_BLACKLIST.includes(hash)) {
					setUnlicensed(true);
				}
			})
			.catch(() => {});
	}, []);

	useEffect(() => {
		if (!unlicensed) {
			return;
		}

		const ensureBanner = () => {
			const banner = document.querySelector('.warning-banner');
			if (!banner) {
				const div = document.createElement('div');
				div.className = 'warning-banner';
				Object.assign(div.style, style, {
					zIndex: '9999',
					// @ts-expect-error
					cssText: `${style.cssText} !important;`,
				});
				div.innerHTML = `
	        <a href="https://github.com/remotion-dev/remotion/pull/4589" style="color: white;">
	          Remotion Unlicensed – Contact hi@remotion.dev
	        </a>
	      `;
				document.body.appendChild(div);
			}
		};

		// Using MutationObserver to watch for changes
		const observer = new MutationObserver(() => ensureBanner());
		observer.observe(document.body, {childList: true, subtree: true});

		return () => {
			observer.disconnect();
		};
	}, [unlicensed]);

	if (!unlicensed) {
		return null;
	}

	return (
		<div style={style} className="warning-banner">
			<a
				style={{color: 'white'}}
				href="https://github.com/remotion-dev/remotion/pull/4589"
			>
				Remotion Unlicensed – Contact hi@remotion.dev
			</a>
		</div>
	);
};
