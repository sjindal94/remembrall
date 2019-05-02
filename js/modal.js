var modal = document.querySelector(".modal");
var closeButton = document.querySelector(".close-button");

//window.onload = modal.classList.toggle("show-modal");
function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);