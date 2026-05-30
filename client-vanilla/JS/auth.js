// ==========================
// LOGIN FUNCTION
// ==========================
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Demo credentials
    if (username === "admin" && password === "1234") {
        localStorage.setItem("user", JSON.stringify({
            username: "admin",
            role: "admin"
        }));

        window.location.href = "admin.html";
    }
    else if (username === "user" && password === "1234") {
        localStorage.setItem("user", JSON.stringify({
            username: "user",
            role: "user"
        }));

        window.location.href = "catalogue.html";
    }
    else {
        alert("Invalid credentials");
    }
}


// ==========================
// CHECK LOGIN
// ==========================
function checkAuth(requiredRole = null) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (requiredRole && user.role !== requiredRole) {
        alert("Access denied");
        window.location.href = "login.html";
    }
}


// ==========================
// LOGOUT
// ==========================
function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// Temporary mock auth

export function getUser() {
    return JSON.parse(localStorage.getItem("user"));
}

export function isLoggedIn() {
    return !!localStorage.getItem("user");
}

// Dummy login (for now)
export function mockLogin() {
    const user = { id: 1, name: "Vijay" };
    localStorage.setItem("user", JSON.stringify(user));
}