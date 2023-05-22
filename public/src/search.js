const form = document.getElementById("searchBar");
const items = document.querySelectorAll(".item-card");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const query = formData.get("search");
  Array.from(items).forEach((item) => {
    const itemName = item.querySelector(".item-name").innerText;
    if (itemName.toLowerCase().includes(query.toLowerCase())) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
});
