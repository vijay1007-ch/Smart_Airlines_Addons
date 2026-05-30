function loadHistory() {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    const user = JSON.parse(localStorage.getItem("user"));

    const container = document.getElementById("history-list");

    container.innerHTML = "";

    if (!user) return;

    // Filter orders for logged-in user
    const userOrders = orders.filter(o => o.user === user.username);

    if (userOrders.length === 0) {
        container.innerHTML = "<p>No orders found</p>";
        return;
    }

    userOrders.forEach(order => {
        container.innerHTML += `
            <div class="order-card">
                <h3>${order.date}</h3>
                <p>Total: ₹${order.total}</p>
                <ul>
                    ${order.items.map(i => `<li>${i.name} - ₹${i.price}</li>`).join("")}
                </ul>
            </div>
        `;
    });
}

window.onload = () => {
    if (typeof checkAuth === "function") {
        checkAuth();
    }
    loadHistory();
};