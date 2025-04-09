import { translations_format } from "/static/js/utils/translations.js";

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

document.getElementById("submit-button").addEventListener("click", async () => {
    const token = document.getElementById('otp').value;
    await AuthByOtp(token);
});

async function AuthByOtp(token) {
    try {
        const response = await fetch(`${window.location.origin}/api/login2fa/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
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