const flights = [
    { id: 1, time: "10:00 AM", price: 5000 },
    { id: 2, time: "02:00 PM", price: 6500 },
    { id: 3, time: "08:00 PM", price: 4500 },
];

const oldFlightPrice = 5000;
let selectedFlight = null;

const container = document.getElementById("flightList");
const summary = document.getElementById("summary");

// Render flights
function renderFlights() {
    container.innerHTML = ""; // clear before render

    flights.forEach(f => {
        const div = document.createElement("div");
        div.className = "flight-card";

        div.innerHTML = `
      <div class="flight-info">
        ${f.time} - ₹${f.price}
      </div>
      <button class="select-btn" onclick="selectFlight(${f.id})">
        Select
      </button>
    `;

        container.appendChild(div);
    });
}

// Select flight
function selectFlight(id) {
    selectedFlight = flights.find(f => f.id === id);

    const diff = selectedFlight.price - oldFlightPrice;

    if (diff > 0) {
        summary.innerHTML = `<span class="extra">Extra Payment: ₹${diff}</span>`;
    } else if (diff < 0) {
        summary.innerHTML = `<span class="refund">Refund: ₹${Math.abs(diff)}</span>`;
    } else {
        summary.innerHTML = `No price change`;
    }
}

// Confirm change
function confirmChange() {
    if (!selectedFlight) return alert("Select a flight");

    const diff = selectedFlight.price - oldFlightPrice;

    if (diff > 0) {
        window.location.href = "payment.html";
    } else {
        alert("Flight changed successfully!");
        window.location.href = "history.html";
    }
}

// Initial render
window.onload = () => {
    if (typeof checkAuth === "function") {
        checkAuth();
    }
    renderFlights();
};