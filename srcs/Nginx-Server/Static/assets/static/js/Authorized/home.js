import { checkAuthorization } from "/static/js/utils/authJWT.js";
import { translations_format } from "/static/js/utils/translations.js"

document.addEventListener('DOMContentLoaded', checkAuthorization);

const lang = parseInt(localStorage.getItem("language"), 10) || 0;
const translations = translations_format[lang];

document.getElementById("title").textContent = translations.gamemenu;
document.getElementById("tournament-btn").textContent = translations.tournament;
document.getElementById("random-match-btn").textContent = translations.randommatch;
document.getElementById("settings-btn").textContent = translations.setting;
document.getElementById("loading-text").textContent = translations.loading;

function handleClick(page) {
    let url = '';
    switch (page) {
        case 'Tournament Battle':
            url = '/pages/tournament/';
            break;
        case 'Random Match':
            url = '/pages/randommatch/';
            break;
        case 'Settings':
            url = '/pages/setting/';
            break;
        case 'Log Out': // ← 大文字小文字注意
            logOut();
            return;
        default:
            console.error('Unknown page:', page);
            return;
    }
    window.location.href = url;
}

window.handleClick = handleClick;

async function logOut() {
    try {
        const response = await fetch(`${window.location.origin}/api/logout/`, {
            method: "POST",
            credentials: 'include'
        });

        const data = await response.json();
        console.log("Logout Response:", data);

        if (response.ok) {
            // クッキー削除（保険）
            deleteCookie("access_token");
            deleteCookie("refresh_token");

            // リダイレクト
            window.location.href = "/";
        } else {
            console.error("Logout failed:", data.message || "Unknown error");
        }
    } catch (error) {
        console.error("Error during logout:", error);
    }
}

function deleteCookie(name) {
    document.cookie = `${name}=; Max-Age=0; path=/;`;
}
``
