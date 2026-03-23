import {AbsoluteFill} from 'remotion';
import './base.css';
import './with-import.css';
import './with-url.css';

export const CssLoaderTest: React.FC = () => {
	return (
		<AbsoluteFill>
			<div className="css-loader-test">
				<h2>CSS Loader Testbed</h2>

				{/* Test 1: Basic CSS rules */}
				<div className="card">Basic CSS rules work</div>

				{/* Test 2: @media query */}
				<div className="card media-query-test">@media query works</div>

				{/* Test 3: CSS custom properties */}
				<div className="card uses-vars">CSS variables work</div>

				{/* Test 4: CSS animation */}
				<div className="card animated">CSS animation works</div>

				{/* Test 5: @import */}
				<div className="card has-import imported-style">
					@import works (should be italic + purple)
				</div>

				{/* Test 6: url() */}
				<div className="card url-card bg-image">
					url() works (background image above)
				</div>
			</div>
		</AbsoluteFill>
	);
};
