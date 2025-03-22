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
            if (loginData.img_url) {
                const qrUrlEncoded = btoa(loginData.img_url);
                alert("qr_表示用ページへ")
                window.location.href = `${window.location.origin}/get_qr/${userid}/${qrUrlEncoded}`
            } else {
                alert("OTPへ")
                window.location.href = `${window.location.origin}/otp/${userid}/`;
            }
        } else {
            window.location.href = `${window.location.origin}/pages/home/`
        }
    } else {
        console.error(loginResponse.message)
        alert("ログイン失敗！")
    }
}
