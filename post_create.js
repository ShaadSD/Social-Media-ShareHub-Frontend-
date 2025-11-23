
const token = localStorage.getItem("token");
const userId = localStorage.getItem("user_id");

console.log("Token:", token, "User ID:", userId);


async function createPost() {
    console.log("createPost called");

    const postTextEl = document.getElementById("postText");
    const postTextRaw = postTextEl ? postTextEl.innerText.trim() : "";
    let postText = postTextRaw === "What's on your mind?" ? "" : postTextRaw;

    const postImage = document.getElementById("postImage")?.files[0] || null;
    const postVideo = document.getElementById("postVideo")?.files[0] || null;

    if (!postText && !postImage && !postVideo) {
        alert("Please write something or attach an image/video!");
        return;
    }

    const formData = new FormData();
    formData.append("user", userId);
    formData.append("text", postText);
    if (postImage) formData.append("image", postImage);
    if (postVideo) formData.append("video", postVideo);


    for (let pair of formData.entries()) {
        console.log("FormData:", pair[0], pair[1]);
    }

    try {
        const response = await fetch("https://social-media-sharehub.onrender.com/api/posts/", {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}` 
             
            },
            body: formData
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to create post:", errorText);
            alert("Failed to create post. Check console for details.");
            return;
        }

        const data = await response.json();
        console.log("Post created:", data);
        alert("Post created successfully!");


        if (postTextEl) postTextEl.innerHTML = '<div style="color:#9aa4b2">What\'s on your mind?</div>';
        if (document.getElementById("postImage")) document.getElementById("postImage").value = "";
        if (document.getElementById("postVideo")) document.getElementById("postVideo").value = "";

    } catch (error) {
        console.error("Network error:", error);
        alert("Network error occurred while creating post.");
    }
}


window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("createPostBtn");
    if (btn) {
        btn.addEventListener("click", createPost);
        console.log("Event listener attached to Post button");
    } else {
        console.log("Post button not found in DOM");
    }
});
