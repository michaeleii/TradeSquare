const joinBtn = document.querySelector("#joinBtn");
const unjoinBtn = document.querySelector("#unjoinBtn");
const createPostBtn = document.querySelector("#createPostBtn");

joinBtn.addEventListener("click", (e) => {
  Swal.fire({
    icon: "success",
    html: "<p class='font-bold text-primary text-3xl'>Successfully added to your Community Page!<p>",
    buttonsStyling: false,
    confirmButtonText: "Check “My Squares”",
    customClass: {
      confirmButton: "btn-primary rounded-lg text-lg mb-2",
    },
  });
  const squareId = e.target.dataset.squareId;
  e.target.classList.add("hidden");
  unjoinBtn.classList.remove("hidden");
  createPostBtn.classList.remove("hidden");
  fetch(`/api/square/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      squareId,
    }),
  });
});

unjoinBtn.addEventListener("click", (e) => {
  Swal.fire({
    icon: "success",
    html: "<p class='font-bold text-primary text-3xl'>Successfully removed from your Community Page!<p>",
    buttonsStyling: false,
    confirmButtonText: "OK",
    customClass: {
      confirmButton: "btn-primary rounded-lg text-lg mb-2",
    },
  });
  const squareId = e.target.dataset.squareId;
  e.target.classList.add("hidden");
  createPostBtn.classList.add("hidden");
  joinBtn.classList.remove("hidden");
  fetch(`/api/square/leave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      squareId,
    }),
  });
});
