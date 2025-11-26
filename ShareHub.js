
const token = localStorage.getItem("token");
const userId = localStorage.getItem("user_id");
const BASE_URL = "https://social-media-sharehub.onrender.com/api/posts/";


const CLOUD_NAME = "dywujlphz";
const UPLOAD_PRESET = "sharehub_unsigned";


async function loadAllPosts() {
    const feedContainer = document.querySelector("#feedArea");
    

    // const scrollPos = window.scrollY;

    try {
        const response = await fetch(BASE_URL, {
            method: "GET",
            headers: { "Authorization": `Token ${token}` }
        });

        if (!response.ok) return console.error("Failed to load posts");

        const posts = await response.json();
        feedContainer.innerHTML = "";

        for (let post of posts) {
    const isOwner = post.created_by.id == userId; 

    const followRes = await fetch(`https://social-media-sharehub.onrender.com/api/follow/?main_user=${post.created_by.id}&follower=${userId}`, {
        headers: { "Authorization": `Token ${token}` }
    });
    const followData = await followRes.json();
    const isFollowed = followData.is_followed; 
    console.log(followData);
    feedContainer.innerHTML += generatePostHTML(post, isFollowed);
    loadLikeCount(post.id);
    loadCommentCount(post.id);
}


        // window.scrollTo(0, scrollPos);

    } catch (err) {
        console.error("Error loading posts:", err);
    }
}
async function loadCommentCount(postId) {
    try {
        const res = await fetch(`https://social-media-sharehub.onrender.com/api/posts/comments/?post=${postId}`, {
            headers: { "Authorization": `Token ${token}` }
        });
        const comments = await res.json();

        const countSpan = document.getElementById(`comment-count-${postId}`);
        if (countSpan) countSpan.innerText = comments.length;

    } catch (err) {
        console.error("Comment count error:", err);
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




function generatePostHTML(post, isFollowed) {
    const isOwner = post.created_by.id == userId;
    console.log(post);
    return `
    <article class="card card-custom mb-4" id="post-${post.id}">
        <!-- Suggested For You -->
        ${!isFollowed && !isOwner ? `<div class="mb-1 p-4" style="font-size:16px; font-weight:bold; color:#6c757d;">Suggested for you</div>` : ''}

        <header class="post-header d-flex align-items-center gap-2 p-2">
            <div class="post-avatar">
                <a href="profile.html?user_id=${post.created_by.id}" 
                        style="text-decoration:none; color:black;"><img src="${post.created_by.image}" class="rounded-circle"/></a>
            </div>
            <div class="post-meta flex-grow-1">
                <div class="d-flex align-items-center gap-2">
                    <div class="name fw-bold">
                        <a href="profile.html?user_id=${post.created_by.id}" 
                        style="text-decoration:none; color:black;">
                        ${post.created_by.username}
                        </a>
                    </div>
                    ${!isFollowed && !isOwner ? `<span class="profile-view" 
                    onclick="window.location.href='profile.html?user_id=${post.created_by.id}'"
                    style="color:#0d6efd; font-weight:600; font-size:18px; cursor:pointer;">
                    Profile View
                </span>` : ''}
                </div>
                <div class="time text-muted" style="font-size:0.8rem">${new Date(post.created_at).toLocaleString()}</div>
            </div>

            ${isOwner ? `
            <div class="post-menu-btn position-relative" onclick="togglePostDropdown(${post.id})">
                <span style="cursor:pointer;" class="three-dots">•••</span>
                <div class="post-dropdown position-absolute bg-white border rounded p-2" id="post-dropdown-${post.id}" style="display:none; right:0; top:100%; z-index:10;">
                    <div style="cursor:pointer;" class="dropdown-item" onclick="startEditPost(${post.id})">Edit</div>
                    <div style="cursor:pointer;" class="dropdown-item" onclick="deletePost(${post.id})">Delete</div>
                </div>
            </div>
            ` : ''}
        </header>

        <div class="post-body p-2"><p id="post-text-${post.id}">${post.text || ""}</p></div>
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
            <div class="add-comment d-flex align-items-center gap-2 mt-2 p-2">
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
        <button class="btn btn-light btn-sm" onclick="loadAllPosts()">Cancel</button>
    `;
}

async function saveEditPost(postId) {
    const newText = document.getElementById(`edit-post-input-${postId}`).value.trim();
    if (!newText) return alert("Post cannot be empty");

    const res = await fetch(`${BASE_URL}${postId}/`, {
        method: "PUT",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: newText })
    });

    if (res.ok) loadAllPosts();
    else alert("Failed to update post");
}

async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const res = await fetch(`${BASE_URL}${postId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Token ${token}` }
    });

    if (res.ok) loadAllPosts();
    else alert("Failed to delete post");
}


function toggleComments(postId) {
    const section = document.getElementById(`comment-section-${postId}`);
    if (!section) return console.error("Comment section not found for post", postId);

    const isVisible = section.style.display === "block";
    section.style.display = isVisible ? "none" : "block";

    if (!isVisible) {
        loadComments(postId);
    }
}

  const card = document.getElementById('sponsoredCard');
  const btn = document.getElementById('dismissBtn');

  btn.addEventListener('click', () => {
    card.style.display = 'none';
  });

async function loadComments(postId) {

    const res = await fetch(`${BASE_URL}comments/?post=${postId}`, {
        headers: {
            "Authorization": `Token ${token}`
        }
    });

    const comments = await res.json();

    if (!Array.isArray(comments)) {
        console.error("Comments is not array:", comments);
        return;
    }

    const list = document.getElementById(`comments-list-${postId}`);
    list.innerHTML = "";

comments.forEach(c => {
    console.log(c);
    list.innerHTML += `
    <div class="single-comment" id="comment-${c.id}">
        <a href="profile.html?user_id=${c.user}"><img src="${c.image}" class="comment-user-pic"></a>

        <div class="comment-body">
            <div><a href="profile.html?user_id=${c.user}" class="comment-username text-decoration-none">${c.username}</a></div>
            <div class="comment-text" id="comment-text-${c.id}">
                ${c.comment}
            </div>
        </div>

        ${c.user == userId ? `
        <div class="comment-menu-btn fw-bold" onclick="toggleDropdown(${c.id})"><span class="three-dots">•••</span></div>

        <div class="comment-dropdown" id="dropdown-${c.id}">
            <div onclick="startEditComment(${postId}, ${c.id}, '${c.comment.replace(/'/g, "\\'")}')">Edit</div>
            <div onclick="deleteComment(${postId}, ${c.id})">Delete</div>
        </div>
        ` : ""}
    </div>
    `;
});

    document.getElementById(`comment-count-${postId}`).innerText = comments.length;
}

function toggleCommentMenu(commentId) {
    const menu = document.getElementById(`comment-menu-${commentId}`);
    if (menu) menu.style.display = menu.style.display === "block" ? "none" : "block";
}
function toggleDropdown(id) {

    document.querySelectorAll(".comment-dropdown").forEach(d => d.style.display = "none");


    const dd = document.getElementById(`dropdown-${id}`);
    dd.style.display = dd.style.display === "block" ? "none" : "block";
}


document.addEventListener("click", function(e) {

    if (!e.target.closest(".comment-menu-btn") && !e.target.closest(".comment-dropdown")) {
        document.querySelectorAll(".comment-dropdown").forEach(d => d.style.display = "none");
    }
});

async function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value.trim();

    if (!text) return;

    await fetch(`${BASE_URL}comments/`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            commentpost: postId,
            comment: text
        })
    });

    input.value = "";
    loadComments(postId);
    loadCommentCount(postId); 
}







function startEditComment(postId, commentId, oldText) {
    const textDiv = document.getElementById(`comment-text-${commentId}`);

    textDiv.innerHTML = `
        <input id="edit-input-${commentId}" 
               class="comment-edit-input" 
               value="${oldText}">
        <button class="btn btn-primary btn-sm mt-1" onclick="saveEdit(${postId}, ${commentId})">Save</button>
        <button class="btn btn-light btn-sm mt-1" onclick="loadComments(${postId})">Cancel</button>
    `;
}

async function saveEdit(postId, commentId) {
    const newText = document.getElementById(`edit-input-${commentId}`).value.trim();

    await fetch(`${BASE_URL}comments/${commentId}/`, {
        method: "PUT",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ comment: newText })
    });

    loadComments(postId);
}
document.getElementById("navbarMyProfile").addEventListener("click", () => {
    const loginUserId = localStorage.getItem("user_id");
    if (loginUserId) {
        window.location.href = `profile.html?user_id=${loginUserId}`;
    }
});

async function deleteComment(postId, commentId) {

    await fetch(`${BASE_URL}comments/${commentId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Token ${token}` }
    });

    loadComments(postId);
    loadCommentCount(postId);
}




async function loadLikeCount(postId) {
    try {
        const res = await fetch(`${BASE_URL}${postId}/like/`, {
            method: "GET",
            headers: { "Authorization": `Token ${token}` }
        });

        const data = await res.json();
        document.getElementById(`like-count-${postId}`).innerText = data.like_count;


        const alreadyLiked = data.likes.some(like => like.user == userId);
        if (alreadyLiked) {
            document.getElementById(`like-btn-${postId}`).innerHTML = `
                <i class="bi bi-hand-thumbs-up-fill text-primary"></i>
                <span id="like-count-${postId}">${data.like_count}</span>
            `;
        }

    } catch (err) {
        console.error("Like count error:", err);
    }
}


async function toggleLike(postId) {
    try {
        const res = await fetch(`${BASE_URL}${postId}/like/`, {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();
        const btn = document.getElementById(`like-btn-${postId}`);

   
        document.getElementById(`like-count-${postId}`).innerText = data.like_count;


        if (data.message === "Like added") {
            btn.innerHTML = `
                <i class="bi bi-hand-thumbs-up-fill text-primary"></i>
                <span id="like-count-${postId}">${data.like_count}</span>
            `;
        } else {
            btn.innerHTML = `
                <i class="bi bi-hand-thumbs-up"></i>
                <span id="like-count-${postId}">${data.like_count}</span>
            `;
        }

    } catch (err) {
        console.error("Toggle like error:", err);
    }
}


async function uploadToCloudinary(file, resource_type = "image") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource_type}/upload`;

    const res = await fetch(url, {
        method: "POST",
        body: formData
    });

    return (await res.json()).secure_url;
}


async function createPostFromModal(fileInputId, textInputId, resource_type = "image") {
    const file = document.getElementById(fileInputId).files[0];
    const text = document.getElementById(textInputId).value.trim();

    if (!file && !text) return alert("Add text or file!");

    let fileUrl = file ? await uploadToCloudinary(file, resource_type) : null;

    const postData = {
        user: userId,
        text: text || "",
        image: resource_type === "image" ? fileUrl : null,
        video: resource_type === "video" ? fileUrl : null
    };

    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
        },
        body: JSON.stringify(postData)
    });

    if (res.ok) {
        loadAllPosts();
        alert("Post created!");
    } else {
        alert("Failed to create post");
    }
}


async function createTextPost() {
    const postText = document.getElementById("postText").innerText.trim();
    if (!postText) return alert("Write something!");

    const postData = { user: userId, text: postText, image: null, video: null };

    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
        },
        body: JSON.stringify(postData)
    });

    if (res.ok) {
        document.getElementById("postText").innerHTML = '<div style="color:#9aa4b2">What\'s on your mind?</div>';
        loadAllPosts();
    } else {
        alert("Failed to post!");
    }
}


let loggedInUserImage = "https://media.istockphoto.com/id/2164630967/vector/people-and-person-icon-people-icon-with-modern-flat-design-people-vector-icon-isolated-on.jpg?s=612x612&w=0&k=20&c=lFYjLbYqoPpRsIGAPr3NUAAIR9k6uLqIWFerhR4F0c4="; 

async function loadUserProfileImage() {
    try {
        const res = await fetch("https://social-media-sharehub.onrender.com/api/profile/", {
            headers: { "Authorization": `Token ${token}` }
        });
        const data = await res.json();
        loggedInUserImage = data.image || loggedInUserImage;


        const navbarImg = document.getElementById("navbarProfileImage");
        if (navbarImg) navbarImg.src = loggedInUserImage;


const avatar = document.querySelector(".composer .post-avatar img");
const profileLink = document.getElementById("profileLink");

if (avatar) avatar.src = loggedInUserImage;

if (profileLink) {
  profileLink.href = `profile.html?user_id=${userId}`;
}
    } catch (err) {
        console.error("Failed to load profile image", err);
    }
}




window.addEventListener("DOMContentLoaded", () => {
    loadUserProfileImage();
    loadAllPosts();

    document.getElementById("createPostBtn").addEventListener("click", createTextPost);

    document.getElementById("postImageBtn").addEventListener("click", () => {
        createPostFromModal("postImage", "postImageText", "image");
        bootstrap.Modal.getInstance(document.getElementById("photoModal")).hide();
    });

    document.getElementById("postVideoBtn").addEventListener("click", () => {
        createPostFromModal("postVideo", "postVideoText", "video");
        bootstrap.Modal.getInstance(document.getElementById("videoModal")).hide();
    });
});
