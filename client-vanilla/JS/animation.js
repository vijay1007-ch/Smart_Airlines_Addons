function applyMagneticEffect() {
    const magnets = document.querySelectorAll(".magnetic");

    magnets.forEach((magnet) => {
        magnet.addEventListener("mousemove", function (e) {
            const rect = magnet.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            magnet.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
        });

        magnet.addEventListener("mouseleave", function () {
            magnet.style.transform = "translate(0,0)";
        });
    });
}