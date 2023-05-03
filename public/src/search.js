function getItems() {
	let items = document.querySelectorAll(".item-card");
	items = [...items].map((item) => {
		return {
			id: item.dataset.id,
			name: item.querySelector("#itemName").innerText,
			imgUrl: item.querySelector("#imgUrl").src,
			seller: item.querySelector("#seller").innerText,
			rating: item.querySelector("#rating").innerText,
			likes: item.querySelector("#likes").innerText,
		};
	});

	return items;
}
function searchItems(items, query) {
	return items.filter((item) =>
		item.name.toLowerCase().includes(query.toLowerCase())
	);
}
function createItemCard(filteredItems, query) {
	itemsContainer.innerHTML = `<div class="grid grid-cols-2 md:grid-cols-4 gap-5 justify-center">
								<h1 class="col-span-2 md:col-span-4">Search Results for ${query}</h1>
								</div>`;
	filteredItems = filteredItems.map((item) => {
		const itemCard = document.createElement("div");
		itemCard.innerHTML = `
								<a href="/items/view/${item.id}">
								<div class="h-full flex flex-col justify-between item-card">
				<div>
					<img
						src="${item.imgUrl}"
						class="w-[165px] h-[130px] object-cover rounded mb-[13px]"
						id="imgUrl"
						alt=""
					/>
					<h2 class="w-[160px] text-[17px] line-clamp-2" id="itemName">
						${item.name}
					</h2>
				</div>
				<div>
					<p class="text-[16px] mt-[5px] mb-[7px]" id="seller">
						${item.seller}
					</p>
					<div class="flex gap-5">
						<div class="flex items-center gap-2">
							<img src="/images/icons/GreyStar.svg" class="w-[15px]" alt="" />
							<span class="text-[12px]" id="rating">${item.rating}</span>
						</div>
						<div class="flex items-center gap-2">
							<img src="/images/icons/LikeGrey.svg" class="w-[15px]" alt="" />
							<span class="text-[12px]" id="likes">${item.likes}</span>
						</div>
					</div>
				</div>
			</div>
			</a>
			</div>
								`;
		itemsContainer.lastChild.appendChild(itemCard);
	});
}
const form = document.getElementById("searchBar");
const itemsContainer = document.getElementById("itemsContainer");
const items = getItems();
form.addEventListener("submit", async (e) => {
	e.preventDefault();
	const formData = new FormData(form);
	const query = formData.get("search");
	let filteredItems = searchItems(items, query);
	createItemCard(filteredItems, query);
});
