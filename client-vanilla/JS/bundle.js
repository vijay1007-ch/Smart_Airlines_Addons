let selectedServices = [];

// Load services
function loadBundle() {
    let services = JSON.parse(localStorage.getItem("services")) || [];

    const container = document.getElementById("bundle-list");

    container.innerHTML = "";

    services.forEach((service, index) => {
        container.innerHTML += `
            <div class="card" onclick="toggleService(${index})" id="service-${index}">
                <h3>${service.name}</h3>
                <p>₹${service.price}</p>
            </div>
        `;
    });
}

// Select / deselect
function toggleService(index) {
    let services = JSON.parse(localStorage.getItem("services")) || [];

    const service = services[index];
    const card = document.getElementById(`service-${index}`);

    const exists = selectedServices.find(s => s.name === service.name);

    if (exists) {
        selectedServices = selectedServices.filter(s => s.name !== service.name);
        card.classList.remove("selected");
    } else {
        selectedServices.push(service);
        card.classList.add("selected");
    }

    calculateTotal();
}


// Calculate total + discount
function calculateTotal() {
    let total = 0;

    selectedServices.forEach(s => total += s.price);

    let discount = total;

    if (selectedServices.length >= 2) {
        discount = total * 0.9; // 10% discount
    }

    document.getElementById("bundle-total").innerText = total;
    document.getElementById("discount-price").innerText = Math.floor(discount);
}


// Add bundle to cart
function addBundleToCart() {
    if (selectedServices.length === 0) {
        alert("Select services first");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;
    selectedServices.forEach(s => total += s.price);

    let finalPrice = selectedServices.length >= 2 ? total * 0.9 : total;

    cart.push({
        name: "Bundle (" + selectedServices.length + " items)",
        price: Math.floor(finalPrice)
    });

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Bundle added to cart");

    selectedServices = [];
    loadBundle();
    calculateTotal();
}

window.onload = () => {
    if (typeof checkAuth === "function") {
        checkAuth();
    }
    loadBundle();
};