import { checkAuthorization } from "/static/js/utils/authJWT.js";
import { translations_format } from "/static/js/utils/translations.js"

document.addEventListener('DOMContentLoaded', checkAuthorization);

const lang = parseInt(localStorage.getItem("language"), 10) || 0;
const translations = translations_format[lang];


document.getElementById("title").textContent = translations.gamemenu;
document.getElementById("tournament-btn").textContent = translations.tournament;
document.getElementById("random-match-btn").textContent = translations.randommatch;
document.getElementById("friend-battle-btn").textContent = translations.friendmatch;
document.getElementById("settings-btn").textContent = translations.setting;
document.getElementById("friend-list-btn").textContent = translations.friendlist;

function handleClick(page) {
    let url = '';
    switch (page) {
        case 'Tournament Battle':
            url = '/pages/tournament/';
            break;
        case 'Random Match':
            url = '/pages/matchmaking/';
            break;
        case 'Friend Battle':
            url = '/friend-battle/';
            break;
        case 'Settings':
            url = '/pages/setting/';
            break;
        case 'Friend List':
            url = '/friend-list/';
            break;
        default:
            console.error('Unknown page:', page);
            return;
    }
    window.location.href = url;
}

window.handleClick = handleClick;
