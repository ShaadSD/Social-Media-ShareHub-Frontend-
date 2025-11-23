document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const loginUserId = localStorage.getItem("user_id");

// profile load hosche
  async function loadProfile() {
    try {
      const res = await fetch("https://social-media-sharehub.onrender.com/api/profile/", {
        headers: { "Authorization": `Token ${token}` }
      });
      const data = await res.json();

      const profileCard = document.getElementById("card-profile");

      profileCard.querySelector(".profile-avatar img").src =
        data.image || `https://res.cloudinary.com/ds97wytcs/image/upload/v1725001777/m6idyx9e4rwnmxawgu8o.png`;
      profileCard.querySelector(".profile-name").textContent = data.username;
      profileCard.querySelector(".profile-role").textContent = data.bio || "bio";
      profileCard.querySelector(".profile-email").textContent = data.email || "Email not set";

      const joinedDate = new Date(data.created_at);
      profileCard.querySelector(".profile-joined").textContent =
        "Joined: " + joinedDate.toLocaleDateString();

      profileCard.querySelector(".profile-stats .stat:nth-child(1) strong").textContent =
        data.total_followers || 0;
      profileCard.querySelector(".profile-stats .stat:nth-child(2) strong").textContent =
        data.total_following || 0;

      profileCard.querySelector(".text-start p").textContent =
        data.about || "No About Added";
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  }

// latest follower
  async function loadSidebarFollowers(searchTerm = "") {
    const API_URL = "https://social-media-sharehub.onrender.com/api/followers/";

    try {
      const response = await fetch(`${API_URL}?user_id=${loginUserId}&type=followers&search=${searchTerm}`, {
        headers: { "Authorization": `Token ${token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch followers");

      const data = await response.json();
      const latestFollowers = data.slice(-4).reverse();

      const container = document.querySelector(".card-custom:last-child");
      container.innerHTML = `
        <h6 class="mb-2 d-flex justify-content-between align-items-center">
          <span>Latest Followers</span>
          <a href="followers.html" class="text-decoration-none" 
             style="font-size:0.85rem; color:var(--accent-1);">See All</a>
        </h6>
        <div class="d-flex flex-column gap-2" id="latestFollowersList"></div>
      `;

      const listDiv = document.getElementById("latestFollowersList");
      listDiv.innerHTML = "";

      latestFollowers.forEach(follower => {
        const imgSrc = follower.image;
        const username = follower.follower_username || "Unknown";
        const first_name = follower.first_name;
        const last_name = follower.last_name;
        console.log(follower)
        const div = document.createElement("div");
        div.classList.add("d-flex", "align-items-center", "justify-content-between");

        div.innerHTML = `
          <div class="d-flex align-items-center gap-2">
            <a href="profile.html?user_id=${follower.follower}">
            <img src="${imgSrc}" style="border-radius:50%; width:42px; height:42px;">
          </a>
            <div>
            <div>
            <a href="profile.html?user_id=${follower.follower}" 
              style="font-weight:600;font-size:.9rem; text-decoration:none; color:#000;">
              ${username}
            </a>
            </div>
            <div class="muted" style="font-size:13px;">${first_name} ${last_name}</div>
            </div>
          </div>
          
        `;
        listDiv.appendChild(div);
      });

    } catch (error) {
      console.error(error);
    }
  }

//  People know
  async function loadPeopleYouMayKnow() {
    try {
      const res = await fetch(`https://social-media-sharehub.onrender.com/api/people-you-may-know/?limit=4`, {
        headers: { "Authorization": `Token ${token}` }
      });

      const people = await res.json();

      const container = document.getElementById("peopleYouMayKnow");
      container.innerHTML = "";

      people.forEach(person => {
        const div = document.createElement("div");
        div.classList.add("d-flex", "align-items-center", "justify-content-between");

        div.innerHTML = `
          <div class="d-flex align-items-center gap-2">
            <a href="profile.html?user_id=${person.id}">
            <img src="${person.image}" style="border-radius:10px;">
          </a>
            <div>
              <div> <a href="profile.html?user_id=${person.id}" 
              style="font-weight:600; text-decoration:none; color:#000;">
              ${person.username}
            </a></div>
              <div class="muted" style="font-size:13px;">Suggeted for you</div>
              <div class="muted" style="font-size:.82rem;">${person.role || ""}</div>
            </div>
          </div>

          <button 
            class="btn btn-sm btn-fancy follow-btn"
            data-id="${person.id}"
            data-following="${person.is_followed}">
            ${person.is_followed ? "Unfollow" : "Follow"}
          </button>
        `;
        container.appendChild(div);
      });

    } catch (err) {
      console.error("Error loading people:", err);
    }
  }

// follow unfollow
  document.addEventListener("click", async function (e) {
    if (!e.target.classList.contains("follow-btn")) return;

    const btn = e.target;
    const targetUserId = btn.dataset.id;
    const isFollowing = btn.dataset.following === "true";

    try {
      if (!isFollowing) {
        const res = await fetch("https://social-media-sharehub.onrender.com/api/follow/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
          },
          body: JSON.stringify({
            main_user:  targetUserId, 
            follower: loginUserId  
          })
        });

        if (!res.ok) throw new Error("Follow failed");

        btn.textContent = "Unfollow";
        btn.dataset.following = "true";
      }

      else {
        const url =
          `https://social-media-sharehub.onrender.com/api/follow/?main_user=${loginUserId}&follower=${targetUserId}&action=unfollow`;

        const res = await fetch(url, {
          method: "DELETE",
          headers: { "Authorization": `Token ${token}` }
        });

        if (!res.ok) throw new Error("Unfollow failed");

        btn.textContent = "Follow";
        btn.dataset.following = "false";
      }

    } catch (err) {
      console.error("Error:", err);
    }
  });


  loadProfile();
  loadSidebarFollowers();
  loadPeopleYouMayKnow();
});
