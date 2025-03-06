// import { checkAuth } from "/static/js/utils/checkAuth.js";
import { translations_landingpage } from "/static/js/utils/translations.js"

const translations = translations_landingpage

function updateLanguage(lang) {
    document.getElementById('welcome').textContent = translations[lang].welcome;
    document.getElementById('signup').textContent = translations[lang].signup;
    document.getElementById('login').textContent = translations[lang].login;
    localStorage.setItem("selected_language", lang);
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
