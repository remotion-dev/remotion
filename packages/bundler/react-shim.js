import * as React from 'react';

if (typeof globalThis === 'undefined') {
	window.React = React;
} else {
	globalThis.React = React;
}
