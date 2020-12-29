const dropdowns = document.querySelectorAll(".dropdown")

dropdowns.forEach(dropdown => {
    dropdown.addEventListener("click", openDrpDwn)
});


function openDrpDwn(e) {
    console.log(this)
    this.firstElementChild.classList.remove("down")
    this.firstElementChild.classList.add("up")
    this.classList.add("active")
    this.classList.add("visible")
    const menu = this.lastElementChild
    menu.classList.remove('hidden')
    menu.classList.add('visible')
    this.removeEventListener("click", openDrpDwn)
    this.addEventListener('click', closeDrpDwn)
}

function closeDrpDwn(e) {
    this.firstElementChild.classList.remove("up")
    this.firstElementChild.classList.add("down")
    this.classList.remove("active")
    this.classList.remove("visible")
    const menu = this.lastElementChild
    menu.classList.remove('visible')
    menu.classList.add('hidden')
    this.removeEventListener("click", closeDrpDwn)
    this.addEventListener('click', openDrpDwn)
}