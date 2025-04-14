import { translations_format } from "/static/js/utils/translations.js";
import { loginflow } from "/static/js/utils/loginflow.js";
import { getDeviceName } from "/static/js/utils/getDeviceName.js";


const deviceName = getDeviceName();

document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // フォーム送信を防ぐ

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");
    console.log("Sending data:", { email, password, deviceName });

    loginflow(email, password, deviceName);
});

