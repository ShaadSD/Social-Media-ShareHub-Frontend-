document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const loginUserId = localStorage.getItem("user_id");

    const API_URL = "https://social-media-sharehub.onrender.com/api/people-you-may-know/?limit=50";
    const followAPI = "https://social-media-sharehub.onrender.com/api/follow/";

    const container = document.getElementById("followersList");
    async function loadLoggedInNavbarImage() {
        try {
            const res = await fetch(`https://social-media-sharehub.onrender.com/api/profile/?user_id=${loginUserId}`, {
                headers: { "Authorization": `Token ${token}` }
            });

            const data = await res.json();
            console.log(data);
            const navImg = document.getElementById("navbarProfileImage");
            if (navImg && data.image) navImg.src = data.image;

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



    async function loadPeople() {
        try {
            const res = await fetch(API_URL, {
                headers: { "Authorization": `Token ${token}` }
            });

            const people = await res.json();
            container.innerHTML = "";

            people.forEach(person => {
                const card = document.createElement("div");
                card.classList.add("d-flex", "align-items-center", "justify-content-between", "p-2");

                const imgSrc = person.image || `https://media.istockphoto.com/id/2164630967/vector/people-and-person-icon-people-icon-with-modern-flat-design-people-vector-icon-isolated-on.jpg?s=612x612&w=0&k=20&c=lFYjLbYqoPpRsIGAPr3NUAAIR9k6uLqIWFerhR4F0c4=`;

                card.innerHTML = `
                  <div class="d-flex align-items-center gap-3">
                      <a href="profile.html?user_id=${person.id}">
                          <img src="${imgSrc}" width="48" height="48" style="border-radius:50%; object-fit:cover;">
                      </a>
                      <div>
                          <a href="profile.html?user_id=${person.id}" style="font-weight:600; text-decoration:none; color:#000;">
                              ${person.username}
                          </a>
                      </div>
                  </div>
                  <button 
                    class="btn btn-sm btn-fancy follow-btn"
                    data-id="${person.id}"
                    data-following="${person.is_followed}">
                    ${person.is_followed ? "Unfollow" : "Follow"}
                  </button>
                `;

                container.appendChild(card);
            });

        } catch (err) {
            console.error("Load error:", err);
        }
    }


    document.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("follow-btn")) return;

        const btn = e.target;
        const targetUserId = btn.dataset.id;
        const isFollowing = btn.dataset.following === "true";

        try {
            if (!isFollowing) {
                await fetch(followAPI, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Token ${token}`
                    },
                    body: JSON.stringify({
                        main_user: targetUserId,
                        follower: loginUserId
                    })
                });

                btn.textContent = "Unfollow";
                btn.dataset.following = "true";
            } else {
                const url = `${followAPI}?main_user=${loginUserId}&follower=${targetUserId}&action=unfollow`;
                await fetch(url, {
                    method: "DELETE",
                    headers: { "Authorization": `Token ${token}` }
                });

                btn.textContent = "Follow";
                btn.dataset.following = "false";
            }

        } catch (err) {
            console.error("Follow/Unfollow error:", err);
        }
    });


    loadLoggedInNavbarImage();
    loadPeople();
});
