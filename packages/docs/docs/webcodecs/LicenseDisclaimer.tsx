import React from 'react';

export const LicenseDisclaimer: React.FC = () => {
	return (
		<>
			<div>
				This package is licensed under the{' '}
				<a href="/docs/license">Remotion License</a>.<br />
				We consider a team of 4 or more people a "company".
			</div>
			<br />
			<div>
				<strong>For "companies"</strong>: A Remotion Company license needs to be
				obtained to use this package.
				<br /> In a future version of{' '}
				<a>
					<code>@remotion/webcodecs</code>
				</a>
				, this package will also require the purchase of a newly created
				"WebCodecs Conversion Seat". <a href="/contact">Get in touch</a> with us
				if you are planning to use this package.
			</div>
			<br />
			<div>
				<strong>For individuals and teams up to 3:</strong> You can use this
				package for free.
			</div>
			<br />
			<div>
				This is a short, non-binding explanation of our license. See the{' '}
				<a href="/docs/license">License</a> itself for more details.
			</div>
		</>
	);
};
