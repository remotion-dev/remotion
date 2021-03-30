// There is no Firefox support yet, the waitForFunction method
// does not yet work and downloading has a bug.
// Disabling this for now!
export const FEATURE_FLAG_FIREFOX_SUPPORT = false;

// Disable this to enter V1 mode and disable breaking changes
// Needed if making future 1.x releases
// See here https://github.com/JonnyBurger/remotion/issues/185 what
// the breaking changes are
export const FEATURE_FLAG_V2_BREAKING_CHANGES = true;

// Mount extra instances of the video to allow for richer video preview
export const FEATURE_FLAG_RICH_PREVIEWS = false;
