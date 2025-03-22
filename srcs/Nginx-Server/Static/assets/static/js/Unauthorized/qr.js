function getUrlParams() {
    const pathSegments = window.location.pathname.split('/');
    const userid = pathSegments[2]; 
    const qrUrlEncoded = pathSegments[3];
    return { userid, qrUrlEncoded };
}

const { userid, qrUrlEncoded } = getUrlParams();
const decodedQrUrl = atob(qrUrlEncoded);
document.getElementById("qrImage").src = `data:image/png;base64,${decodedQrUrl}`;

document.getElementById("qr-ok-btn").addEventListener("click", () => {
    window.location.href = `${window.location.origin}/otp/${userid}/`;
});