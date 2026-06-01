/**
 * API Service helper to dynamically resolve the backend server URL.
 * Allows the user to configure custom network IP/domains in a settings modal
 * to bypass issues where localhost is inaccessible on mobile or cross-network devices.
 */

export const getApiUrl = () => {
    return localStorage.getItem("API_URL") || "http://localhost:5000";
};

export const setApiUrl = (url) => {
    if (!url) return;
    let cleanUrl = url.trim();
    // Strip trailing slashes
    if (cleanUrl.endsWith("/")) {
        cleanUrl = cleanUrl.slice(0, -1);
    }
    localStorage.setItem("API_URL", cleanUrl);
};

export const is2FAEnabled = () => {
    // 2FA is active by default, but can be toggled via the settings UI.
    const stored = localStorage.getItem("2FA_ENABLED");
    return stored === null ? true : stored === "true";
};

export const set2FAEnabled = (enabled) => {
    localStorage.setItem("2FA_ENABLED", enabled ? "true" : "false");
};
