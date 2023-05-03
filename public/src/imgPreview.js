const imageInput = document.querySelector("#image");
const imagePreview = document.querySelector("#preview");
const inputIcons = document.querySelectorAll(".input-icon");
imageInput.onchange = (event) => {
	const [file] = imageInput.files;
	if (file) {
		imagePreview.src = URL.createObjectURL(file);
		inputIcons.forEach((icon) => {
			icon.classList.add("hidden");
		});
		imagePreview.classList.remove("hidden");
	}
};
