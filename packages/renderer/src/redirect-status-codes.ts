// Don't handle 304 status code (Not Modified) as a redirect,
// since the browser will display the right page.
export const redirectStatusCodes = [301, 302, 303, 307, 308];
