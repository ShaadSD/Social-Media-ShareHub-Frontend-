document.addEventListener('DOMContentLoaded', () => {
  const alertContainer = document.getElementById('alert-container');
  const alertMessage = document.getElementById('alert-message');
  const closeAlert = document.getElementById('close-alert');

  const showAlert = (msg) => {
    alertMessage.textContent = msg;
    alertContainer.style.display = 'flex';
  };

  const hideAlert = () => {
    alertContainer.style.display = 'none';
  };

  closeAlert.addEventListener('click', hideAlert);

  const getValue = (id) => document.getElementById(id)?.value.trim();

  async function handleRegistration(event) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.textContent = "Processing...";

    const username = getValue("username");
    const first_name = getValue("first_name");
    const last_name = getValue("last_name");
    const email = getValue("email");
    const password = getValue("password");
    const confirm_password = getValue("confirm_password");

    if (password !== confirm_password) {
      showAlert("Password and confirm password do not match");
      btn.disabled = false;
      btn.textContent = "SIGN UP";
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(password)) {
      showAlert("Password must contain one letter, one number, one special char, min 8 chars.");
      btn.disabled = false;
      btn.textContent = "SIGN UP";
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/user/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, first_name, last_name, email, password, confirm_password })
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert("Registration failed: " + JSON.stringify(data));
      } else {
        showAlert("Registration successful! Check your email to confirm.");
        form.reset();
      }

    } catch (err) {
      console.error(err);
      showAlert("Something went wrong. Try again.");
    } finally {
      btn.disabled = false;
      btn.textContent = "SIGN UP";
    }
  }

  const registerForm = document.getElementById('signup-form');
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegistration);
  }
});
