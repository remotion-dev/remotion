let chromiumDisableWebSecurity = false;
let ignoreCertificateErrors = false;

export const getChromiumDisableWebSecurity = () => chromiumDisableWebSecurity;
export const getIgnoreCertificateErrors = () => ignoreCertificateErrors;
export const setChromiumDisableWebSecurity = (should: boolean) => {
	chromiumDisableWebSecurity = should;
};

export const setChromiumIgnoreCertificateErrors = (should: boolean) => {
	ignoreCertificateErrors = should;
};
