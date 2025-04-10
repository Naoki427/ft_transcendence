import { translations_landingpage } from "/static/js/utils/translations.js"
import { redirectIfAuthenticated } from "/static/js/utils/authJWT.js";

document.addEventListener('DOMContentLoaded', redirectIfAuthenticated);

const translations = translations_landingpage

function updateLanguage(lang) {
    document.getElementById('welcome').textContent = translations[lang].welcome;
    document.getElementById('signup').textContent = translations[lang].signup;
    document.getElementById('login').textContent = translations[lang].login;
    localStorage.setItem("language", lang);
}

document.getElementById('language').addEventListener('change', function() {
    updateLanguage(this.value);
});

document.getElementById('signup').addEventListener('click', function() {
    window.location.href = '/signup/'
});

document.getElementById('login').addEventListener('click', function() {
    window.location.href = '/login/'
});

// Initialize with English
updateLanguage(0);
