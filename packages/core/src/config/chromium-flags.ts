let chromiumDisableWebSecurity = false;
let ignoreCertificateErrors = false;

export const getChromiumDisableWebSecurity = () => chromiumDisableWebSecurity;
export const getIgnoreCertificateErrors = () => ignoreCertificateErrors;
export const setChromiumDisableWebSecurity = (should: boolean) => {
	chromiumDisableWebSecurity = should;
};

export const setIgnoreCertificateErrors = (should: boolean) => {
	ignoreCertificateErrors = should;
};
