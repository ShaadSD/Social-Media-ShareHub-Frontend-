document.addEventListener('DOMContentLoaded', () => {
  const alertContainer = document.getElementById('alert-container');
  const alertMessage = document.getElementById('alert-message');
  const closeAlert = document.getElementById('close-alert');


  const showAlert = (msg) => {
    alertMessage.textContent = msg;
    alertContainer.style.display = 'flex';
  };
  const hideAlert = () => alertContainer.style.display = 'none';
  closeAlert.addEventListener('click', hideAlert);


  const getValue = id => document.getElementById(id)?.value.trim();


  const defaultBtn = document.querySelector(".dflt");
  if (defaultBtn) {
    defaultBtn.addEventListener("click", () => {
      document.getElementById("login-email").value = "ash715614@gmail.com";
      document.getElementById("login-password").value = ".gpajt dmw";
    });
  }


  async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.textContent = "Loading...";

    const email = getValue("login-email");
    const password = getValue("login-password");

    if (!email || !password) {
      showAlert("Email and password are required.");
      btn.disabled = false;
      btn.textContent = "Login";
      return;
    }

    try {
      const res = await fetch("https://social-media-sharehub.onrender.com/api/user/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }) 
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert(data.detail || "Invalid credentials. Try again.");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        window.location.href = "ShareHub.html";
      }
    } catch (err) {
      console.error(err);
      showAlert("Something went wrong. Try again later.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Login";
    }
  }


  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});
