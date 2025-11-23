const token = localStorage.getItem("token");
const userId = localStorage.getItem("user_id");
const API_URL = "https://social-media-sharehub.onrender.com/api/followers/";

const followersList = document.getElementById("followersList");
const searchInput = document.getElementById("searchFollower");
const searchBtn = document.getElementById("searchBtn");
async function loadFollowers(searchTerm = "") {
    if (!token || !userId) {
        followersList.innerHTML = "<p>Please login first.</p>";
        return;
    }

    try {
        let url = `${API_URL}?user_id=${userId}&type=followers`;
        if (searchTerm) {
            url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        const res = await fetch(url, {
            headers: {
                "Authorization": `Token ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch followers");

        const data = await res.json();
        console.log(data);
        renderFollowers(data);
    } catch (err) {
        console.error(err);
        followersList.innerHTML = "<p>Failed to load followers.</p>";
    }
}
async function loadLoggedInNavbarImage() {
    try {
        const res = await fetch(`https://social-media-sharehub.onrender.com/api/profile/?user_id=${userId}`, {
            headers: { "Authorization": `Token ${token}` }
        });

        const data = await res.json();
        const navImg = document.getElementById("navbarProfileImage");
        if (navImg) navImg.src = data.image;
    } catch (err) {
        console.error("Navbar image load failed:", err);
    }
}



const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        const token = localStorage.getItem("token");

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

function renderFollowers(followers) {
    followersList.innerHTML = "";

    if (followers.length === 0) {
        followersList.innerHTML = "<p>No followers found.</p>";
        return;
    }

    followers.forEach(follower => {
        const div = document.createElement("div");
        div.classList.add("follower-item", "d-flex", "justify-content-between", "align-items-center", "mb-3", "p-2", "border-bottom");
        div.innerHTML = `
            <div class="follower-left d-flex align-items-center gap-2">
                <img src="${follower.image}" alt="" style="border-radius:10px;">
                <div>
                    <a href="profile.html?user_id=${follower.follower}" class="text-secondary text-decoration-none">
                        <strong>${follower.follower_username}</strong>
                    </a><br>
                    <span class="muted">Follower</span>
                </div>
            </div>
            <button class="btn btn-sm btn-outline-danger btn-remove" data-follower="${follower.follower}">Remove</button>
        `;
        followersList.appendChild(div);
    });

    document.querySelectorAll(".btn-remove").forEach(btn => {
        btn.addEventListener("click", () => removeFollower(btn.dataset.follower));
    });
}

async function removeFollower(followerUserId) {
    try {
        const res = await fetch(`${API_URL}manage/?main_user=${userId}&follower=${followerUserId}&action=remove_follower`, {
            method: "DELETE",
            headers: { "Authorization": `Token ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            loadFollowers(searchInput.value.trim());
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong!");
    }
}

searchBtn.addEventListener("click", () => {
    const term = searchInput.value.trim();
    loadFollowers(term);
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchBtn.click();
});

loadFollowers();
loadLoggedInNavbarImage();