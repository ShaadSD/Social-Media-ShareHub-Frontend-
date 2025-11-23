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

  async function reset_request(event) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.textContent = "Sending...";

    const email = getValue("reset-email");

    if (!email) {
      showAlert("Please enter your email.");
      btn.disabled = false;
      btn.textContent = "SEND RESET LINK";
      return;
    }

    try {
      const res = await fetch("https://social-media-sharehub.onrender.com/api/password/reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        showAlert(data.error || data.detail || "Something went wrong. Try again.");
        btn.disabled = false;
        btn.textContent = "SEND RESET LINK"; 
      } else {
        showAlert(data.detail || "If an account exists for this email, a reset link has been sent.");
        btn.disabled = true;
        btn.textContent = "Email Sent!";
      }
    } catch (err) {
      console.error(err);
      showAlert("Something went wrong. Try again later.");
      btn.disabled = false;
      btn.textContent = "SEND RESET LINK";
    }
  }

  const resetForm = document.getElementById("reset-request-form");
  if (resetForm) {
    resetForm.addEventListener("submit", reset_request);
  }
});