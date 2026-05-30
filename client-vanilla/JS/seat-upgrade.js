const seats = [
    { seatNo: "1A", status: "available", price: 2000 },
    { seatNo: "1B", status: "booked", price: 2000 },
    { seatNo: "1C", status: "available", price: 2000 },
    { seatNo: "2A", status: "available", price: 1500 },
    { seatNo: "2B", status: "booked", price: 1500 },
    { seatNo: "2C", status: "available", price: 1500 },
];

let selectedSeat = null;

const grid = document.getElementById("seatGrid");
const info = document.getElementById("seatInfo");

function renderSeats() {
    grid.innerHTML = "";

    seats.forEach((seat) => {
        const div = document.createElement("div");
        div.className = `seat ${seat.status}`;
        div.innerText = seat.seatNo;

        div.onclick = () => selectSeat(seat);

        grid.appendChild(div);
    });
}

function selectSeat(seat) {
    if (seat.status === "booked") return;

    seats.forEach((s) => {
        if (s.seatNo === seat.seatNo) {
            s.status = "selected";
            selectedSeat = s;
        } else if (s.status === "selected") {
            s.status = "available";
        }
    });

    info.innerHTML = `
    Selected: ${selectedSeat.seatNo} <br>
    Price: ₹${selectedSeat.price}
  `;

    renderSeats();
}

function confirmSeat() {
    if (!selectedSeat) {
        alert("Please select a seat to upgrade.");
        return;
    }
    alert(`Successfully upgraded to seat ${selectedSeat.seatNo} for ₹${selectedSeat.price}`);
    window.location.href = "history.html";
}

window.onload = () => {
    if (typeof checkAuth === "function") {
        checkAuth();
    }
    renderSeats();
};