import { translations_format } from "/static/js/utils/translations.js";
import { loginflow } from "/static/js/utils/loginflow.js";
import { getDeviceName } from "/static/js/utils/getDeviceName.js";
import { redirectIfAuthenticated } from "/static/js/utils/authJWT.js";

document.addEventListener('DOMContentLoaded', redirectIfAuthenticated);
const lang = parseInt(localStorage.getItem("language"), 10) || 0;
const translations = translations_format[lang];

document.getElementById("game-title").textContent = translations.login;
document.getElementById("menu-title").textContent = translations.accessPanel;
document.getElementById("email-label").textContent = translations.email;
document.getElementById("password-label").textContent = translations.password;
document.getElementById("login-btn").textContent = translations.login;

const deviceName = getDeviceName();

document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // フォーム送信を防ぐ

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");
    console.log("Sending data:", { email, password, deviceName });

    loginflow(email, password, deviceName);
});

