const form = document.getElementById("contactForm");
const token = localStorage.getItem("token");
const userId = localStorage.getItem("user_id");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const subject = document.getElementById("subject").value.trim();
        const message = document.getElementById("message").value.trim();

        const payload = {
            user: userId,
            name,
            email,
            subject,
            message
        };

        try {
            const res = await fetch("https://social-media-sharehub.onrender.com/api/contact/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Failed to send message");
                return;
            }

            alert("✅ Message sent successfully!");
            form.reset();

        } catch (err) {
            console.error("Error:", err);
            alert("Something went wrong!");
        }
    });
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await fetch("https://social-media-sharehub.onrender.com/api/user/logout/", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${token}`
                }
            });

            localStorage.removeItem("token");
            localStorage.removeItem("user_id");

            window.location.href = "login.html";

        } catch (err) {
            console.error("Logout failed:", err);
        }
    });
}


async function loadLoggedInNavbarImage() {
    try {
        const res = await fetch(`https://social-media-sharehub.onrender.com/api/profile/`, {
            headers: { "Authorization": `Token ${token}` }
        });

        const data = await res.json();

        const navImg = document.getElementById("navbarProfileImage");
        if (navImg && data.image) {
            navImg.src = data.image;
        }

    } catch (err) {
        console.error("Navbar image load failed:", err);
    }
}
document.getElementById("navbarMyProfile").addEventListener("click", () => {
    const loginUserId = localStorage.getItem("user_id");
    if (loginUserId) {
        window.location.href = `profile.html?user_id=${loginUserId}`;
    }
});
loadLoggedInNavbarImage();
