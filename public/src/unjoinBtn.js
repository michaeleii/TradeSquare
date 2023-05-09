const unjoinBtn = document.querySelector(".unjoin-btn");

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
  e.target.remove();
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
