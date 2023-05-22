const form = document.getElementById("searchBar");
const items = document.querySelectorAll(".item-card");
const headingTitle = document.querySelector("#headingTitle");
const noItemsMsg = document.querySelector("#noItemsMsg");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const query = formData.get("search");
  headingTitle.innerText = `Search Results for: ${query}`;
  let count = 0;
  Array.from(items).forEach((item) => {
    const itemName = item.querySelector(".item-name").innerText;
    if (itemName.toLowerCase().includes(query.toLowerCase())) {
      item.style.display = "block";
      count++;
    } else {
      item.style.display = "none";
    }
  });
  noItemsMsg.style.display = !count ? "block" : "none";
});
