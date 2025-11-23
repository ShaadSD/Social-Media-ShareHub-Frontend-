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
async function handlePasswordReset(event) {

  event.preventDefault();
  const btn = event.target.querySelector("button[type='submit']");
  btn.disabled = true;
  btn.textContent = "Processing...";

  const new_password = getValue("new-password");
  const confirm_password = getValue("confirm-password");

  if (new_password !== confirm_password) {
    showAlert("Passwords do not match");
    btn.disabled = false;
    btn.textContent = "Save Password";
    return;
  }


  if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(new_password)) {
    showAlert("Password must contain one letter, one number, one special char, min 8 chars.");
    btn.disabled = false;
    btn.textContent = "Save Password";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const uid = urlParams.get("uid");
  const token = urlParams.get("token");

  if (!uid || !token) {
    showAlert("Invalid password reset link.");
    btn.disabled = false;
    btn.textContent = "Save Password";
    return;
  }

  try {
    const res = await fetch(`https://social-media-sharehub.onrender.com/api/password/reset/confirm/?uid=${uid}&token=${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_password })
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert("Error: " + JSON.stringify(data));
    } else {
      showAlert("Password reset successful!");
      event.target.reset();

      setTimeout(() => window.location.href = "/login.html", 2000);
    }

  } catch (err) {
    console.error(err);
    showAlert("Something went wrong. Try again.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Password";
  }
}
 const resetForm = document.getElementById("reset-password");
  if (resetForm) {
    resetForm.addEventListener("submit", handlePasswordReset);
  }
});
