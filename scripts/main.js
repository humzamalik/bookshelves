import {get, getAll, update, search } from './BooksAPI.js'

const segment = document.querySelector("#segment")
const searchbar = document.querySelector("#search").querySelector(".menu")
const addDiv = document.querySelector(".add")

let isReadMode = true

let books
let searchedBooks
let shelfKeeper = {}

let timeout

async function init() {
    modeMonitor()
    const data = await getAll()
    books = data
    updateKeeper()
    loadshelves()
}

async function getBook(id) {
    const book = await get(id)
    books.push(book)
}

function updateKeeper() {
    books.forEach(book => {
        shelfKeeper[book.id] = book.shelf
    });
}

function updateBook(id, newShelf, prevShelf) {
    try {
        update(id, newShelf)
    } catch (error) {
        updateBookShelf(id, prevShelf)
        loadshelves()
    }
}

function addAndUpdateBook(id, newShelf, prevShelf) {
    try {
        if (prevShelf == 'none') {
            searchedBooks.forEach(book => {
                if (book.id == id) {
                    books.push(book)
                }
            })
        }
        updateBookShelf(id, newShelf)
        update(id, newShelf)
    } catch (error) {
        updateBookShelf(id, prevShelf)
    }
}

function updateBookShelf(id, shelf) {
    books.forEach(book => {
        if (book.id == id) {
            book.shelf = shelf
            shelfKeeper[id] = shelf
        }
    })
}

function shelfManager(book) {
    if (book.id in shelfKeeper) {
        return shelfKeeper[book.id]
    }
    return 'none'
}

function modeMonitor() {
    if (isReadMode) {
        searchbar.classList.add("hidden")
        addDiv.addEventListener("click", modeSwitcher)
    }
}

function modeSwitcher(e) {
    isReadMode = !isReadMode
    if (isReadMode) {
        addDiv.classList.remove("hideit")
        searchbar.classList.add("hidden")
        loadshelves()
        addDiv.addEventListener("click", modeSwitcher)
    } else {
        addDiv.classList.add("hideit")
        searchbar.classList.remove("hidden")
        segment.innerHTML = ''
        searchbar.querySelector(".item").addEventListener("click", modeSwitcher)
        searchbar.querySelector("input").addEventListener("input", onSeachInput)
    }
}

function loadshelves() {
    const currentlyReading = books.filter((book) => book.shelf == 'currentlyReading')
    const wantToRead = books.filter((book) => book.shelf == 'wantToRead')
    const read = books.filter((book) => book.shelf == 'read')
    const shlevesHtml = `
    ${buildShelf("Currently Reading", currentlyReading)}
    ${buildShelf("Want to read", wantToRead)}
    ${buildShelf("Read", read)}
    `
    segment.innerHTML = shlevesHtml
    activateListeners()
}

function buildShelf(title, shelfBooks) {
    if (shelfBooks == undefined || shelfBooks.length == 0) {
        return `
        <h2 class="ui medium header">${title}</h2>
        <h1 class="ui header centered">No Books</h1>
        `
    }
    return `
    <h2 class="ui medium header">${title}</h2>
    <div class="ui eight cards">
        ${shelfBooks.map((book) => {
            const shelf = shelfManager(book)
            return `
            <div class="ui card">
                <div class="image">
                    <img src="${book.imageLinks.thumbnail}" alt="" style="height: 300px;">
                    <div class="ui circular dropdown icon button right floated black" tabindex="0" style="position: absolute;bottom: 0;right: 0;">
                        <i class="chevron down icon"></i>
                        <div class="menu transition hidden" tabindex="-1">
                            <div class="item"  data-id="${book.id}" data-shelf="${shelf}" data-thisshelf="currentlyReading">
                                <i class="check icon ${shelf == 'currentlyReading' ? '' : 'hideit'}"></i> Currently reading
                            </div>
                            <div class="item" data-id="${book.id}" data-shelf="${shelf}" data-thisShelf="wantToRead">
                                <i class="check icon ${shelf == 'wantToRead' ? '' : 'hideit'}"></i> Want to read
                            </div>
                            <div class="item" data-id="${book.id}" data-shelf="${shelf}" data-thisShelf="read">
                                <i class="check icon ${shelf == 'read' ? '' : 'hideit'}"></i> Read
                            </div>
                            <div class="item" data-id="${book.id}" data-shelf="${shelf}" data-thisShelf="none">
                                <i class="check icon ${shelf == 'none' ? '' : 'hideit'}"></i> None
                            </div>
                        </div>
                    </div>
                </div>
                <div class="content">
                    <div class="header">${book.title}</div>
                    <div class="meta">${book.authors ? book.authors.join(", "): ''}</div>
                </div>
            </div>
            `
        }).join("")}
    </div>
    `
}

function onSeachInput(e){
    const kw = this.value
    if(timeout){clearTimeout(timeout)}
    timeout = setTimeout(async function(){
        const data = await search(kw)
        searchedBooks = data
        console.log(searchedBooks)
        const shlevesHtml = `
        ${buildShelf("Search Results", searchedBooks)}
        `
        segment.innerHTML = shlevesHtml
        activateListeners()
    }, 500)
}

async function searchData(kw){
    const searchedBooks = await search(kw)
    console.log(searchedBooks)
}

function activateListeners(){
    const dropdowns = document.querySelectorAll(".dropdown")
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener("click", openDrpDwn)
    });
}

function openDrpDwn(e) {
    this.firstElementChild.classList.remove("down")
    this.firstElementChild.classList.add("up")
    this.classList.add("active")
    this.classList.add("visible")
    const menu = this.lastElementChild
    menu.classList.remove('hidden')
    menu.classList.add('visible')
    this.removeEventListener("click", openDrpDwn)
    this.addEventListener('click', closeDrpDwn)
    // this.querySelectorAll(".item").forEach((item) => {
    //     item.addEventListener("click", itemHandler)
    // })
}

function closeDrpDwn(e) {
    if(e.target.classList.contains("item") || e.target.parentElement.classList.contains("item")){
        const item = e.target.classList.contains("item") ? e.target : e.target.parentElement
        const itemData = item.dataset
        if(itemData.shelf != itemData.thisshelf){
            if(isReadMode){
                updateBookShelf(itemData.id, itemData.thisshelf)
                updateBook(itemData.id, itemData.thisshelf, itemData.shelf)
                loadshelves()
            } else{
                addAndUpdateBook(itemData.id, itemData.thisshelf, itemData.shelf)
            }
        } 
    }
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

init()