import { translations_format } from '../utils/translations.js';
import { redirectIfAuthenticated } from "/static/js/utils/authJWT.js";

document.addEventListener('DOMContentLoaded', redirectIfAuthenticated);

// Get language preference from localStorage or default to English (0)
const languagePreference = localStorage.getItem('language') ? parseInt(localStorage.getItem('language')) : 0;
const translations = translations_format[languagePreference];

// Apply translations to the page
function applyTranslations() {
    document.getElementById('scan-qr-title').textContent = translations.scan_qr_code;
    document.getElementById('scan-qr-instruction').textContent = translations.scan_qr_instruction;
    document.getElementById('scan-qr-app-instruction').textContent = translations.scan_qr_app_instruction;
    document.getElementById('qr-ok-btn').textContent = 'OK';
}

function getUrlParams() {
    const pathSegments = window.location.pathname.split('/');
    const userid = pathSegments[2]; 
    const qrUrlEncoded = pathSegments[3];
    return { userid, qrUrlEncoded };
}

// Initialize the page
function initPage() {
    // Apply translations
    applyTranslations();
    
    // Load QR code
    const { userid, qrUrlEncoded } = getUrlParams();
    const decodedQrUrl = atob(qrUrlEncoded);
    document.getElementById("qrImage").src = `data:image/png;base64,${decodedQrUrl}`;
    
    // Set up button event listener
    document.getElementById("qr-ok-btn").addEventListener("click", () => {
        window.location.href = `${window.location.origin}/otp/${userid}/`;
    });
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initPage);