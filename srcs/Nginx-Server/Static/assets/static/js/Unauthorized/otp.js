import { translations_format } from "/static/js/utils/translations.js";
import { redirectIfAuthenticated } from "/static/js/utils/authJWT.js";

document.addEventListener('DOMContentLoaded', redirectIfAuthenticated);

const pathSegments = window.location.pathname.split('/');
const userid = pathSegments[2]; 

// 言語設定を取得
const lang = parseInt(localStorage.getItem("language"), 10) || 0;
const translations = translations_format[lang];

// 翻訳を直接適用
document.getElementById("otp-title").textContent = translations.otp_title;
document.getElementById("otp-label").textContent = translations.otp_label;
document.getElementById("otp").placeholder = translations.otp_placeholder;
document.getElementById("submit-button").textContent = translations.otp_submit;

function getCSRFToken() {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    console.log(document.cookie);
    return match ? match[1] : null;
}

document.getElementById("submit-button").addEventListener("click", async (event) => {
    const token = document.getElementById('otp').value;
    const csrftoken = getCSRFToken();
    console.log("Sending with csrf-token:", csrftoken);
    await AuthByOtp(token, csrftoken);
});

async function AuthByOtp(token, csrftoken) {
    try {
        const response = await fetch(`${window.location.origin}/api/login2fa/`, {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify({ userid: userid, token: token })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Login successful:", data);
            window.location.href = `${window.location.origin}/pages/home/`
        } else {
            console.error("Login failed:", data);
            alert(data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
}
