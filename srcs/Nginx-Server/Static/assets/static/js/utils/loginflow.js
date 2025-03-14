export async function loginflow(email, password, deviceName) {
    const loginResponse = await fetch(`${window.location.origin}/api/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email, password: password, device_name: deviceName })
    })
    if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log(loginData)
        if (loginData.is_2fa_needed) {
            const userid = loginData.userid
            if (loginData.qr_url) {
                const qrUrlEncoded = btoa(loginData.qr_url);
                alert("qr_表示用ページへ")
                // window.location.href = `${window.location.origin}/get_qr/${userid}/${qrUrlEncoded}`
            } else {
                alert("OTPへ")
                
            }
        } else {
            const userid = loginData.userid
            localStorage.setItem("access_token", loginData.access_token);
            localStorage.setItem("refresh_token", loginData.refresh_token);
            localStorage.setItem("language", loginData.lang);
            window.location.href = `${window.location.origin}/pages/home/`
        }
    } else {
        console.error(loginResponse.message)
        alert("ログイン失敗！")
    }
}
