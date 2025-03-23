export function checkAuthorization() {
    document.getElementById("loading-screen").innerHTML = "<h1>認証中...</h1>";

    fetch('/api/jwt/', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            document.getElementById("loading-screen").style.display = "none";
            document.querySelector(".container").style.display = "block";
        } else {
            console.log(data);
            window.location.href = `${window.location.origin}`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = `${window.location.origin}`;
    });
}

export function redirectIfAuthenticated() {

    fetch('/api/jwt/', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            window.location.href = `${window.location.origin}/pages/home/`;
        } else {
            console.log(data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = `${window.location.origin}`;
    });
}

