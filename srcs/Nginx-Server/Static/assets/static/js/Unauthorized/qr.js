function getUrlParams() {
    const pathSegments = window.location.pathname.split('/');  // `/` で分割
    const userid = pathSegments[2]; 
    const qrUrlEncoded = pathSegments[3];
    return { userid, qrUrlEncoded };
}

const { userid, qrUrlEncoded } = getUrlParams();

// ✅ QRコードを取得し、表示する関数
async function fetchQRCode() {
        const decodedQrUrl = atob(qrUrlEncoded);
        document.getElementById("qrImage").src = `data:image/png;base64,${decodedQrUrl}`;
}


// ✅ ページ読み込み時に QRコードを取得
window.onload = fetchQRCode;


document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("qr-ok-btn").addEventListener("click", () => {
		// ✅ email と qr_code_url を URL パラメータとして渡す
		window.location.href = `${window.location.origin}/authenticator/otp/?email=${encodeURIComponent(email)}}`;
	});
});