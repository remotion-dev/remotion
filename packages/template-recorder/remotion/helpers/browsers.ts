export const isFirefox = (): boolean => {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.userAgent !== "string"
  ) {
    return false;
  }

  // The userAgent contains 'Firefox' for Firefox browsers,
  // and should NOT contain 'Seamonkey' (a related Mozilla suite)
  return (
    /firefox/i.test(navigator.userAgent) &&
    !/seamonkey/i.test(navigator.userAgent)
  );
};
