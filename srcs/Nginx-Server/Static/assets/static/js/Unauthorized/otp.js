const pathSegments = window.location.pathname.split('/');
const userid = pathSegments[2]; 

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
        } else {
            console.error("Login failed:", data);
            alert(data.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
}