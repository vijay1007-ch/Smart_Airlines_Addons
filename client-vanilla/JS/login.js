// login.js - Specific logic for login.html

function handleLogin() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === "admin" && pass === "1234") {
        localStorage.setItem("user", JSON.stringify({
            username: "admin",
            role: "admin"
        }));
        window.location.href = "admin.html";
    } else if (user === "user" && pass === "1234") {
        localStorage.setItem("user", JSON.stringify({
            username: "user",
            role: "user"
        }));
        window.location.href = "catalogue.html";
    } else {
        alert("Invalid Credentials");
    }
}

// Check if already logged in
window.onload = () => {
    const user = localStorage.getItem("user");
    if (user) {
        const parsed = JSON.parse(user);
        if (parsed.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "catalogue.html";
        }
    }
};
