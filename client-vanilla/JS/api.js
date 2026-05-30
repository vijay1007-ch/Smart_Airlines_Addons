async function loadServices() {
    try {
        const res = await fetch("http://localhost:5000/addons");
        const data = await res.json();

        const container = document.getElementById("services");

        data.forEach(item => {
            const div = document.createElement("div");

            div.innerHTML = `
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
        <button onclick="addToCart(${item.id}, '${item.name}', ${item.price})">
          Add to Cart
        </button>
      `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error("Error:", err);
    }
}

async function addToCart(id, name, price) {
    await fetch("http://localhost:5000/cart", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, name, price })
    });

    console.log("Added to cart");
}

loadServices();