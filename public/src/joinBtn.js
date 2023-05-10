const joinBtn = document.querySelector(".join-btn");

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
  e.target.remove();
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
