const likeIcon = document.querySelector(".like-icon");

likeIcon.addEventListener("click", async () => {
  if (likeIcon.classList.contains("liked")) {
    likeIcon.classList.remove("liked");
  } else {
    likeIcon.classList.add("liked");
  }
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      itemId: likeIcon.dataset.itemId,
    }),
  };
  await fetch(`/api/item/like/`, options);
});

likeIcon.addEventListener("touchend", async () => {
  if (likeIcon.classList.contains("liked")) {
    likeIcon.classList.remove("liked");
  } else {
    likeIcon.classList.add("liked");
  }
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      itemId: likeIcon.dataset.itemId,
    }),
  };
  await fetch(`/api/item/like/`, options);
});
