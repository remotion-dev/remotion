// organize-imports-ignore

// Fast Refresh must come first,
// because setup-environment imports ReactDOM.
// If React DOM is imported before Fast Refresh, Fast Refresh does not work
import './fast-refresh/runtime';
import './setup-environment';
import './hot-middleware/client';
import './error-overlay/entry-basic.js';
