export function getDeviceName() {
    const userAgent = navigator.userAgent;
    if (/windows/i.test(userAgent)) return "Windows";
    if (/macintosh|mac os x/i.test(userAgent)) return "Mac";
    if (/linux/i.test(userAgent)) return "Linux";
    if (/android/i.test(userAgent)) return "Android";
    if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
    return "Unknown Device";
}