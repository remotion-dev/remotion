let chromiumDisableWebSecurity = false;
let ignoreCertificateErrors = false;

export const getChromiumDisableWebSecurity = () => chromiumDisableWebSecurity;
export const setChromiumDisableWebSecurity = (should: boolean) => {
	chromiumDisableWebSecurity = should;
};

export const getIgnoreCertificateErrors = () => ignoreCertificateErrors;
export const setChromiumIgnoreCertificateErrors = (should: boolean) => {
	ignoreCertificateErrors = should;
};
