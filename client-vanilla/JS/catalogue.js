// Load catalogue from localStorage
function loadCatalogue() {
    let services = JSON.parse(localStorage.getItem("services")) || [];

    const container = document.getElementById("catalogue-list");

    if (!container) {
        console.error("catalogue-list not found");
        return;
    }

    container.innerHTML = "";

    if (services.length > 0) {
        services.forEach(service => {
            container.innerHTML += `
                <div class="card magnetic">
                    <h3>${service.name}</h3>
                    <p>₹${service.price}</p>
                    <button onclick="addToCart('${service.name}', ${service.price})">Add ₹${service.price}</button>
                </div>
            `;
        });
    }

    // apply animation after rendering
    if (typeof applyMagneticEffect === "function") {
        applyMagneticEffect();
    }
}

// Run when page loads
window.onload = () => {
    if (typeof checkAuth === "function") {
        checkAuth();
    }
    loadCatalogue();
};