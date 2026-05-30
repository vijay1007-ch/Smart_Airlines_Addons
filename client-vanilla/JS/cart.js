/* =========================
   LOAD FUNCTIONS CONTROLLER
========================= */
window.onload = function () {
    if (typeof checkAuth === "function") {
        checkAuth();
    }

    if (document.getElementById("catalogue-list")) {
        loadCatalogue();
    }

    if (document.getElementById("cart-items")) {
        loadCart();
    }
};


/* =========================
   CATALOGUE (Dynamic)
========================= */
function loadCatalogue() {
    let services = JSON.parse(localStorage.getItem("services")) || [];

    const container = document.getElementById("catalogue-list");
    if (!container) return;

    container.innerHTML = "";

    if (services.length === 0) {
        container.innerHTML = "<p>No services available</p>";
        return;
    }

    services.forEach(service => {
        container.innerHTML += `
            <div class="card magnetic">
                <h3>${service.name}</h3>
                <p>₹${service.price}</p>
                <button onclick="addToCart('${service.name}', ${service.price})">Add</button>
            </div>
        `;
    });

    if (typeof applyMagneticEffect === "function") {
        applyMagneticEffect();
    }
}


/* =========================
   CART LOGIC
========================= */
function loadCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const container = document.getElementById("cart-items");
    const totalElement = document.getElementById("total-price");

    if (!container || !totalElement) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty">Your cart is empty</p>`;
        totalElement.innerText = "0";
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        container.innerHTML += `
            <div class="card magnetic">
                <h3>${item.name}</h3>
                <p>₹${item.price}</p>
                <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
            </div>
        `;
    });

    totalElement.innerText = total;

    if (typeof applyMagneticEffect === "function") {
        applyMagneticEffect();
    }
}


/* =========================
   ADD / REMOVE
========================= */
function addToCart(name, price) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push({ name, price });

    localStorage.setItem("cart", JSON.stringify(cart));

    showToast("Added to cart");
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();
}


/* =========================
   PLACE ORDER
========================= */async function placeOrder() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        showToast("Cart is empty!");
        return;
    }

    // 👉 GET existing orders
    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    const user = JSON.parse(localStorage.getItem("user"));

    // 👉 Create new order
    const newOrder = {
        user: user ? user.username : "guest",
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0),
        date: new Date().toLocaleString()
    };

    orders.push(newOrder);

    localStorage.setItem("orders", JSON.stringify(orders));

    try {
        await fetch("http://localhost:3000/api/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newOrder)
        });
    } catch {
        console.log("Backend not connected");
    }

    showToast("Order placed successfully");

    // small UX improvement
    setTimeout(() => {
        window.location.href = "history.html";
    }, 1200);

    localStorage.removeItem("cart");
    loadCart();
}


function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}