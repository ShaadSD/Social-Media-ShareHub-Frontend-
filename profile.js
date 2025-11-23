
const token = localStorage.getItem("token");
const user_id = localStorage.getItem("user_id");
const BASE_URL = "https://social-media-sharehub.onrender.com/api/posts/";
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("user_id");


async function saveProfile() {
    const username = document.getElementById("editName2").value.trim();
    const firstName = document.getElementById("editName").value.trim();
    const lastName = document.getElementById("editName1").value.trim();
    const bio = document.getElementById("editBio").value.trim();
    const about = document.getElementById("editabout").value.trim();
    const imageFile = document.getElementById("editImage").files[0];

    let imageUrl = null;

    if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "sharehub_unsigned"); 

        try {
            const res = await fetch("https://api.cloudinary.com/v1_1/dywujlphz/image/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            imageUrl = data.secure_url;
        } catch(err) {
            console.error("Cloudinary upload failed:", err);
            alert("Image upload failed");
            return;
        }
    }

    const payload = {
        username,
        firstName,
        lastName,
        bio,
        about
    };
    if (imageUrl) payload.image_url = imageUrl;

    try {
        const res = await fetch("https://social-media-sharehub.onrender.com/api/profile/", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Profile update failed");

        const data = await res.json();

        document.getElementById("profileName").innerText = data.username;
        document.getElementById("profileBio").innerText = data.about || "No about added";
        document.getElementById("profileImage").src = data.image;
        const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        loadProfileInfo()
        modal.hide();
        
    } catch(err) {
        console.error(err);
        alert("Profile update failed.");
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


function loadLatestPhotos(posts) {
    const container = document.getElementById("latestPhotos");
    container.innerHTML = "";


    const photoPosts = posts.filter(p => p.image);
       

    photoPosts.slice(0, 2).forEach(p => {
        const img = document.createElement("img");
        img.src = p.image;
        img.className = "sidebar-img";
        container.appendChild(img);
    });
}


async function loadLoggedInNavbarImage() {
    try {
        const res = await fetch(`https://social-media-sharehub.onrender.com/api/profile/?user_id=${user_id}`, {
            headers: { "Authorization": `Token ${token}` }
        });

        const data = await res.json();
        

        const navImg = document.getElementById("navbarProfileImage");
        if (navImg) navImg.src = data.image;

        loggedInUserImage = data.image;

    } catch (err) {
        console.error("Navbar image load failed:", err);
    }
}


async function loadProfileForEdit() {
    try {
        const res = await fetch(`https://social-media-sharehub.onrender.com/api/profile/?user_id=${userId}`, {
            headers: { "Authorization": `Token ${token}` }
        });
        const data = await res.json();

        document.getElementById("editName2").value = data.username || "";
        document.getElementById("editName").value = data.first_name || "";
        document.getElementById("editName1").value = data.last_name || "";
        document.getElementById("editBio").value = data.bio || "";
        document.getElementById("editabout").value = data.about || "";
        document.getElementById("editImagePreview").src = data.image || "";

    } catch (err) {
        console.error("Failed to load profile for edit:", err);
    }
}

const editModal = document.getElementById("editModal");
editModal.addEventListener("show.bs.modal", loadProfileForEdit);
async function loadProfileInfo() {
    try {
        const res = await fetch(`https://social-media-sharehub.onrender.com/api/profile/?user_id=${userId}`, {
            headers: { "Authorization": `Token ${token}` }
        });
        const data = await res.json();
        console.log(data);
        document.getElementById("profileName").innerText = data.username;
        document.getElementById("profileBio").innerText = data.about || "No about added";
        document.getElementById("FullName").innerText = data.first_name + " " + data.last_name;
        document.getElementById("profileEmail").innerText = data.email;
        document.getElementById("profileJoined").innerText = new Date(data.created_at).toLocaleDateString();
        document.getElementById("profileImage").src = data.image
        loggedInUserImage = data.image
        document.getElementById("totalFollowers").innerText = data.total_followers || 0;
        document.getElementById("totalFollowing").innerText = data.total_following || 0;
        document.getElementById("totalbio").innerText = data.bio || "No bio added";


        


        const editBtn = document.getElementById("editProfileBtn");
        

            if (user_id == userId) {
                editBtn.style.display = "inline-block";
            } else {
                editBtn.style.display = "none";
            }
            loadLatestFollowers();

    } catch (err) {
        console.error("Profile load failed:", err);
    }
}

async function setupFollowButton() {
    const followBtn = document.getElementById("followProfileBtn");


    if (user_id == userId) {
        followBtn.style.display = "none";
        return;
    }

    try {

        const res = await fetch(`https://social-media-sharehub.onrender.com/api/follow/?main_user=${userId}&follower=${user_id}`, {
            headers: { "Authorization": `Token ${token}` }
        });
        const data = await res.json();
        console.log(data);

        followBtn.textContent = data.is_followed ? "Unfollow" : "Follow";
        followBtn.dataset.following = data.is_followed;

        followBtn.style.display = "inline-block";

        followBtn.onclick = async () => {
            try {
                if (followBtn.dataset.following === "true") {
                    // Unfollow
                    const url = `https://social-media-sharehub.onrender.com/api/follow/?main_user=${user_id}&follower=${userId}&action=unfollow`;
                    const res = await fetch(url, { method: "DELETE", headers: { "Authorization": `Token ${token}` } });
                    if (!res.ok) throw new Error("Unfollow failed");
                    followBtn.textContent = "Follow";
                    followBtn.dataset.following = "false";
                } else {
                    // Follow
                    const res = await fetch(`https://social-media-sharehub.onrender.com/api/follow/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Token ${token}`
                        },
                        body: JSON.stringify({ main_user: userId, follower: user_id })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error("Follow failed");
                    followBtn.textContent = "Unfollow";
                    followBtn.dataset.following = "true";
                }


            } catch (err) {
                console.error("Error following/unfollowing:", err);
            }
        };

    } catch (err) {
        console.error("Failed to setup follow button:", err);
    }
}



async function loadMyPosts() {
    const container = document.getElementById("myPostsArea");

    try {
        const res = await fetch(`${BASE_URL}?user_id=${userId}`, {
            headers: { "Authorization": `Token ${token}` }
        });

        if (!res.ok) return console.error("Failed to load user posts");

        const posts = await res.json();
        container.innerHTML = "";

        posts.forEach(post => {
            container.innerHTML += generatePostHTML(post);
            loadLikeCount(post.id);
            loadCommentCount(post.id);
        });
        loadLatestPhotos(posts);

    } catch (err) {
        console.error("Error loading posts:", err);
    }
}


function generatePostHTML(post) {
    const isOwner = post.created_by.id == user_id;

    return `
    <article class="card card-custom mb-4" id="post-${post.id}">
        <header class="post-header d-flex align-items-center gap-2 p-2">
            <div class="post-avatar">
                <a href="profile.html?user_id=${post.created_by.id}" 
                        style="text-decoration:none; color:black;"><img src="${post.created_by.image}" class="rounded-circle"/></a>
            </div>
            <div class="post-meta flex-grow-1">
                <div class="fw-bold"><a href="profile.html?user_id=${post.created_by.id}" 
                        style="text-decoration:none; color:black;">
                        ${post.created_by.username}
                        </a></div>
                <div class="text-muted" style="font-size:0.8rem">${new Date(post.created_at).toLocaleString()}</div>
            </div>
            ${isOwner ? `
            <div class="post-menu-btn position-relative" onclick="togglePostDropdown(${post.id})">
               
                <span class="three-dots" style="cursor:pointer;">•••</span>
                <div class="post-dropdown position-absolute bg-white border rounded p-2" id="post-dropdown-${post.id}" style="display:none; right:0; top:100%; z-index:10;">
                    <div class="dropdown-item" style="cursor:pointer;" onclick="startEditPost(${post.id})">Edit</div>
                    <div class="dropdown-item" style="cursor:pointer;" onclick="deletePost(${post.id})">Delete</div>
                </div>
            </div>
            ` : ''}
        </header>

        <div class="post-body p-2">
            <p id="post-text-${post.id}">${post.text || ""}</p>
        </div>

        ${post.image ? `<img class="post-image p-2 rounded" src="${post.image}" style="width:100%;">` : ""}
        ${post.video ? `<video controls class="post-image p-2" style="width:100%;"><source src="${post.video}"></video>` : ""}

        <div class="post-footer p-2">
            <button class="btn btn-sm btn-light" onclick="toggleLike(${post.id})" id="like-btn-${post.id}">
                <i class="bi bi-hand-thumbs-up"></i>
                <span id="like-count-${post.id}">0</span>
            </button>
            <button class="btn btn-sm btn-ghost btn-comment" onclick="toggleComments(${post.id})">
                <i class="bi bi-chat"></i> Comment (<span id="comment-count-${post.id}">0</span>)
            </button>
        </div>

        <div class="comment-section mt-2" id="comment-section-${post.id}" style="display:none;">
            <div id="comments-list-${post.id}" class="comments-list p-2"></div>
            <div class="add-comment d-flex align-items-center gap-2 p-2">
                <img src="${loggedInUserImage}" class="comment-avatar">
                <input type="text" id="comment-input-${post.id}" class="form-control comment-input" placeholder="Write a comment..." />
                <button class="btn btn-primary btn-sm px-3" onclick="addComment(${post.id})">Post</button>
            </div>
        </div>
    </article>
    `;
}


function togglePostDropdown(postId) {
    document.querySelectorAll(".post-dropdown").forEach(d => d.style.display = "none");
    const dd = document.getElementById(`post-dropdown-${postId}`);
    dd.style.display = dd.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", function(e) {
    if (!e.target.closest(".post-menu-btn") && !e.target.closest(".post-dropdown")) {
        document.querySelectorAll(".post-dropdown").forEach(d => d.style.display = "none");
    }
});


function startEditPost(postId) {
    const textDiv = document.getElementById(`post-text-${postId}`);
    const oldText = textDiv.innerText;

    textDiv.innerHTML = `
        <textarea id="edit-post-input-${postId}" class="form-control mb-2">${oldText}</textarea>
        <button class="btn btn-primary btn-sm me-2" onclick="saveEditPost(${postId})">Save</button>
        <button class="btn btn-light btn-sm" onclick="loadMyPosts()">Cancel</button>
    `;
}

async function saveEditPost(postId) {
    const newText = document.getElementById(`edit-post-input-${postId}`).value.trim();
    await fetch(`${BASE_URL}${postId}/`, {
        method: "PUT",
        headers: { "Authorization": `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText })
    });
    loadMyPosts();
}

async function deletePost(postId) {
    if(!confirm("Delete this post?")) return;
    await fetch(`${BASE_URL}${postId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Token ${token}` }
    });
    loadMyPosts();
}


async function loadLikeCount(postId) {
    const res = await fetch(`${BASE_URL}${postId}/like/`, { headers: { "Authorization": `Token ${token}` } });
    const data = await res.json();
    const btn = document.getElementById(`like-btn-${postId}`);
    const liked = data.likes.some(l => l.user == user_id);
    document.getElementById(`like-count-${postId}`).innerText = data.like_count;
    btn.innerHTML = liked ? 
        `<i class="bi bi-hand-thumbs-up-fill text-primary"></i> <span id="like-count-${postId}">${data.like_count}</span>` :
        `<i class="bi bi-hand-thumbs-up"></i> <span id="like-count-${postId}">${data.like_count}</span>`;
}

async function toggleLike(postId) {
    const res = await fetch(`${BASE_URL}${postId}/like/`, { method: "POST", headers: { "Authorization": `Token ${token}` } });
    await loadLikeCount(postId);
}


async function loadCommentCount(postId) {
    const res = await fetch(`${BASE_URL}comments/?post=${postId}`, { headers: { "Authorization": `Token ${token}` } });
    const list = await res.json();
    document.getElementById(`comment-count-${postId}`).innerText = list.length;
}

function toggleComments(postId) {
    const section = document.getElementById(`comment-section-${postId}`);
    section.style.display = section.style.display === "block" ? "none" : "block";
    if(section.style.display === "block") loadComments(postId);
}

async function loadComments(postId) {
    const res = await fetch(`${BASE_URL}comments/?post=${postId}`, { headers: { "Authorization": `Token ${token}` } });
    const comments = await res.json();
    const listDiv = document.getElementById(`comments-list-${postId}`);
    listDiv.innerHTML = "";

comments.forEach(c => {

    const isOwner = c.user == user_id;
    console.log(c);
    listDiv.innerHTML += `
    <div class="single-comment" id="comment-${c.id}" style="position:relative;">
        <a href="profile.html?user_id=${c.user}"><img src="${c.image}" class="comment-user-pic"></a>
        <div class="comment-body">
            <div><a href="profile.html?user_id=${c.user}" class="comment-username text-decoration-none">${c.username}</a></div>
            <div class="comment-text" id="comment-text-${c.id}">${c.comment}</a></div>
        </div>

        ${isOwner ? `
        <div class="comment-menu-btn" onclick="toggleDropdown(${c.id})" style="cursor:pointer;">
            <span class="three-dots">•••</span>
        </div>

        <div class="comment-dropdown" id="dropdown-${c.id}" 
            style="display:none; position:absolute; right:0; background:white; border:1px solid #ccc; padding:5px; z-index:10;">
            <div onclick="startEditComment(${postId}, ${c.id}, '${c.comment.replace(/'/g,"\\'")}')">Edit</div>
            <div onclick="deleteComment(${postId}, ${c.id})">Delete</div>
        </div>
        ` : ""}
    </div>`;
});

    document.getElementById(`comment-count-${postId}`).innerText = comments.length;
}
navbarProfileImage
document.addEventListener("click", function(e) {
    if (!e.target.closest(".comment-menu-btn") && !e.target.closest(".comment-dropdown")) {
        document.querySelectorAll(".comment-dropdown").forEach(d => d.style.display = "none");
    }
});

async function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value.trim();
    if(!text) return;
    await fetch(`${BASE_URL}comments/`, {
        method: "POST",
        headers: { "Authorization": `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ commentpost: postId, comment: text })
    });
    input.value = "";
    loadComments(postId);
    loadCommentCount(postId);
}

function toggleDropdown(id) {
    document.querySelectorAll(".comment-dropdown").forEach(d => d.style.display = "none");
    const dd = document.getElementById(`dropdown-${id}`);
    if(dd) dd.style.display = dd.style.display === "block" ? "none" : "block";
}

function startEditComment(postId, commentId, oldText) {
    const textDiv = document.getElementById(`comment-text-${commentId}`);
    textDiv.innerHTML = `
        <input id="edit-input-${commentId}" class="form-control comment-edit-input" value="${oldText}">
        <button class="btn btn-primary btn-sm mt-1" onclick="saveEditComment(${postId}, ${commentId})">Save</button>
        <button class="btn btn-light btn-sm mt-1" onclick="loadComments(${postId})">Cancel</button>
    `;
}

async function saveEditComment(postId, commentId) {
    const newText = document.getElementById(`edit-input-${commentId}`).value.trim();
    if(!newText) return alert("Comment cannot be empty");
    await fetch(`${BASE_URL}comments/${commentId}/`, {
        method: "PUT",
        headers: { "Authorization": `Token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newText })
    });
    loadComments(postId);
}

async function deleteComment(postId, commentId) {
    if(!confirm("Delete this comment?")) return;
    await fetch(`${BASE_URL}comments/${commentId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Token ${token}` }
    });
    loadComments(postId);
    loadCommentCount(postId);
}
async function loadSuggestionsForYou() {
    try {
        const res = await fetch(`https://social-media-sharehub.onrender.com/api/people-you-may-know/?limit=4`, {
            headers: { "Authorization": `Token ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch suggestions");

        const people = await res.json();
        const container = document.getElementById("suggestionsForYou");
        container.innerHTML = "";

        people.forEach(person => {
            const div = document.createElement("div");
            div.classList.add("d-flex", "align-items-center", "justify-content-between", "mb-2");

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
                        <div class="muted" style="font-size:13px;">Suggested for you</div>
                        <div class="muted" style="font-size:.82rem;">${person.role || ""}</div>
                    </div>
                </div>
                <button 
                    class="btn btn-sm btn-fancy fw-bold follow-btn"
                    data-id="${person.id}"
                    data-following="${person.is_followed}">
                    ${person.is_followed ? "Unfollow" : "Follow"}
                </button>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error("Error loading suggestions:", err);
    }
}






document.getElementById("navbarMyProfile").addEventListener("click", () => {
    const loginUserId = localStorage.getItem("user_id");
    if (loginUserId) {
        window.location.href = `profile.html?user_id=${loginUserId}`;
    }
});

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
            main_user: targetUserId,
            follower: user_id
        })
    });

    const data = await res.json();
    console.log("FOLLOW RESPONSE:", data);

    if (!res.ok) throw new Error("Follow failed");


    btn.textContent = "Unfollow";
    btn.dataset.following = "true";
}else {
            
            const url = `https://social-media-sharehub.onrender.com/api/follow/?main_user=${user_id}&follower=${targetUserId}&action=unfollow`;

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


async function initializeProfile() {
    await setupFollowButton(); 
    await loadLoggedInNavbarImage();
    await loadProfileInfo();
    await loadMyPosts();
    await loadSuggestionsForYou();
}

window.addEventListener("DOMContentLoaded", initializeProfile);
