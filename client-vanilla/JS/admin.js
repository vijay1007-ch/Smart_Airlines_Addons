// Load services
function loadServices() {
    let services = JSON.parse(localStorage.getItem("services")) || [];

    const container = document.getElementById("service-list");
    container.innerHTML = "";

    if (services.length === 0) {
        container.innerHTML = "<p>No services added</p>";
        return;
    }

    services.forEach((service, index) => {
        container.innerHTML += `
            <div class="card">
                <h3>${service.name}</h3>
                <p>₹${service.price}</p>
                <button class="delete-btn" onclick="deleteService(${index})">Delete</button>
            </div>
        `;
    });
}


// Add service
function addService() {
    const name = document.getElementById("service-name").value;
    const price = document.getElementById("service-price").value;

    if (!name || !price) {
        alert("Enter valid details");
        return;
    }

    let services = JSON.parse(localStorage.getItem("services")) || [];

    services.push({
        name: name,
        price: parseInt(price)
    });

    localStorage.setItem("services", JSON.stringify(services));

    document.getElementById("service-name").value = "";
    document.getElementById("service-price").value = "";

    loadServices();
}


// Delete service
function deleteService(index) {
    let services = JSON.parse(localStorage.getItem("services")) || [];

    services.splice(index, 1);

    localStorage.setItem("services", JSON.stringify(services));

    loadServices();
}


// Init
window.onload = () => {
    if (typeof checkAuth === "function") {
        checkAuth("admin");
    }
    loadServices();
};