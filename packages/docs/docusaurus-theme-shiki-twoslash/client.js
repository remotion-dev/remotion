if (typeof window !== 'undefined') {
	const handleCopy = async (e) => {
		if (e.target.classList.contains('copy-button')) {
			const button = e.target;
			const pre = button.closest('pre');
			if (!pre) return;

			// Logic to extract code text.
			// Shiki output usually has code > div.line
			const codeElement = pre.querySelector('code');
			let text = '';

			if (codeElement) {
				// Clone to avoid modifying DOM if we need to
				const clone = codeElement.cloneNode(true);
				// Remove line numbers if they exist? (Usually shiki doesn't include line numbers in textContent unless they are content)
				text = clone.textContent;
			} else {
				// Fallback
				text = pre.innerText;
				// Remove the "Copy" button text from the end if it was included
				// But button is a child of pre.
				// clone the pre excluding the button
				const clone = pre.cloneNode(true);
				const buttonInClone = clone.querySelector('.copy-button');
				if (buttonInClone) buttonInClone.remove();
				text = clone.textContent;
			}

			try {
				await navigator.clipboard.writeText(text);
				const originalText = button.innerText;
				button.innerText = 'Copied';
				setTimeout(() => {
					button.innerText = originalText;
				}, 2000);
			} catch (err) {
				console.error('Failed to copy!', err);
			}
		}
	};

	document.addEventListener('click', handleCopy);
}
