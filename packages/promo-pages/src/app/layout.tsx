import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'Remotion | Make videos programmatically',
	description:
		'Use React to compose and render videos, and build video applications.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`remotion-tailwind-landing antialiased`}>
				{children}
			</body>
		</html>
	);
}
