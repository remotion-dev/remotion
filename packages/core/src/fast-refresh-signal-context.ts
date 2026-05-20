import {createContext} from 'react';

// Incremented every time the studio detects that webpack HMR has applied
// updates (i.e. once `__webpack_module__.hot` reports the `idle` status).
//
// This is read by `CompositionErrorBoundary` to know when to drop the
// `hasError` flag and attempt to render the composition again. Without it,
// once the boundary catches a runtime error, it returns `null` forever and
// the error UI persists even after the user fixes the underlying bug.
//
// Defaults to `0` (the value used when no provider is in the tree, e.g.
// in `@remotion/player`, where there is no Fast Refresh).
export const FastRefreshSignalContext = createContext<number>(0);
