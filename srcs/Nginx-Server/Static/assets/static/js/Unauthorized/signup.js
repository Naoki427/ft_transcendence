import { translations_format } from "/static/js/utils/translations.js";
import { getDeviceName } from "/static/js/utils/getDeviceName.js";
import { loginflow } from "/static/js/utils/loginflow.js";

const translations = translations_format;
const lang = localStorage.getItem("selected_language") || 0;
document.getElementById('signup-label').textContent = translations[lang].signup;
document.getElementById('username-label').textContent = translations[lang].username;
document.getElementById('email-label').textContent = translations[lang].email;
document.getElementById('password-label').textContent = translations[lang].password;
document.getElementById('2fa-label').textContent = translations[lang].twofa;
document.getElementById('signupBtn-label').textContent = translations[lang].signup;

const usernameInput = document.getElementById('username');
usernameInput.oninvalid = function(event) {
  if (usernameInput.validity.valueMissing) {
    event.target.setCustomValidity(translations[lang].fillout);
  }
};
usernameInput.oninput = function(event) {
  if (event.target.value === '') {
    event.target.setCustomValidity(translations[lang].fillout);
  } else {
    event.target.setCustomValidity('');
  }
};

const emailInput = document.getElementById('email');
emailInput.oninvalid = function(event) {
  if (emailInput.validity.valueMissing) {
    event.target.setCustomValidity(translations[lang].fillout);
  } else if (emailInput.validity.typeMismatch) {
    event.target.setCustomValidity(translations[lang].validemail);
  }
};
emailInput.oninput = function(event) {
  if (event.target.value === '') {
    event.target.setCustomValidity(translations[lang].fillout);
  } else if (emailInput.validity.typeMismatch) {
    event.target.setCustomValidity(translations[lang].validemail);
  } else {
    event.target.setCustomValidity('');
  }
};

const passwordInput = document.getElementById('password');
passwordInput.oninvalid = function(event) {
  if (passwordInput.validity.valueMissing) {
    event.target.setCustomValidity(translations[lang].fillout);
  }  else if (passwordInput.validity.patternMismatch) {
    event.target.setCustomValidity(translations[lang].validpassword);
  }
};
passwordInput.oninput = function(event) {
  if (event.target.value === '') {
    event.target.setCustomValidity(translations[lang].fillout);
  } else if (passwordInput.validity.patternMismatch) {
    event.target.setCustomValidity(translations[lang].validpassword);
  } else {
    event.target.setCustomValidity('');
  }
};



async function signupflow(username, email, password, is_2fa_enabled, language, deviceName) {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("language", language);
    formData.append("password", password);
    formData.append("is_2fa_enabled", is_2fa_enabled);

    try {
        if (!username || username.length > 10) {
            alert("ユーザーネームは１〜１０文字以内で入力してください")
            return ;
        }
        document.getElementById("loading-screen").classList.remove("d-none");
        console.log("Sending data:", Object.fromEntries(formData.entries())); // 🔍 送信データを確認
        const response = await fetch(`${window.location.origin}/api/signup/`, {
            method: "POST",
            body: formData
        });

        const data = await response.json()
        if (response.ok) {
            deviceName = getDeviceName()
            loginflow(email, password, deviceName)
        }
    } catch (error) {
        console.error("Error: ", error);
    }
}

document.getElementById("signupForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const userEmail = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const language = lang
    const is_2fa_enabled = document.getElementById("enable-2fa").checked;
    const deviceName = getDeviceName();
    signupflow(username, userEmail, password, is_2fa_enabled, language, deviceName)
});