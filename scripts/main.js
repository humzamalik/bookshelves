import {get, getAll, update, search } from './BooksAPI.js'

let shelfDetails = localStorage.getItem('shelfDetails')
if (!shelfDetails) {
    shelfDetails = new Object()
    localStorage.setItem('shelfDetails', JSON.stringify(shelfDetails))
} else {
    shelfDetails = JSON.parse(shelfDetails)
}
let isReadMode = true

const container = document.querySelector('.container')
const header = document.querySelector(".header")
const searchHeader = document.querySelector(".search-header")

async function loadShelves() {
    const books = await getAll()
        // console.log(books)
    const currentlyReading = books.filter((book) => book.shelf == 'currentlyReading')
    const wantToRead = books.filter((book) => book.shelf == 'wantToRead')
    const read = books.filter((book) => book.shelf == 'read')
    const shlevesHtml = `
    <div class="shelves">
    ${buildShelf("Currently Reading", buildUl(currentlyReading))}
    ${buildShelf("Want to read", buildUl(wantToRead))}
    ${buildShelf("Read", buildUl(read))}
    </div>
    `
    container.innerHTML = shlevesHtml
    container.innerHTML += '<div class="add">+</div>'
    activateListeners()
}

async function updateAndReload(bookId, shelf) {
    shelfDetails[bookId] = shelf
    localStorage.setItem('shelfDetails', JSON.stringify(shelfDetails))
    await update(bookId, shelf)
    if (isReadMode) {
        loadShelves()
    }
}

function activateListeners() {
    const dropBtns = document.querySelectorAll(".drop-btn")
    if (isReadMode) {
        const addBtn = document.querySelector('.add')
        addBtn.addEventListener('click', switchMode)
    }
    dropBtns.forEach(dropBtn => {
        dropBtn.addEventListener("click", dropBtnClick)
    })
}

function switchMode(e) {
    isReadMode = !isReadMode
    if (isReadMode) {
        header.classList.remove("hide-header")
        searchHeader.classList.add("hide-header")
        loadShelves()
    } else {
        header.classList.add("hide-header")
        searchHeader.classList.remove("hide-header")
        container.innerHTML = ''
        const backBtn = document.querySelector(".search-header>button")
        const searchForm = document.querySelector("form")
        backBtn.addEventListener("click", switchMode)
        searchForm.addEventListener("submit", searchInputSub)
    }
}

async function searchKeyword(keyword) {
    const books = await search(keyword)
    console.log(books)
    const shlevesHtml = `
    <div class="shelves">
    ${buildShelf("Search Results", buildUl(books))}
    </div>
    `
    container.innerHTML = shlevesHtml
    activateListeners()
}

function searchInputSub(e) {
    e.preventDefault()
    const input = e.target.querySelector("input")
    if (input.value) {
        searchKeyword(input.value)
    }
}


function dropBtnClick(e) {
    const dropSpans = e.target.nextElementSibling
    dropSpans.classList.add("show")
    dropSpans.addEventListener('click', dropSpanClick)
}

function dropSpanClick(e) {
    this.classList.remove("show")
    const shelf = e.target.dataset['type']
    const id = this.dataset['id']
    const currentShelf = this.dataset['current']
    if (shelf != currentShelf) {
        updateAndReload(id, shelf)
    }
    this.removeEventListener('click', dropSpanClick)
}

function shelfManager(book) {
    if (isReadMode) {
        shelfDetails[book.id] = book.shelf
        localStorage.setItem('shelfDetails', JSON.stringify(shelfDetails))
        return book.shelf
    }
    if (book.id in shelfDetails) {
        return shelfDetails[book.id]
    }
    return 'none'
}

function buildUl(data) {
    return `<ul>${data.map((book) => {
        const shelf = shelfManager(book)
        return `
        <li>
            <img src="${book.imageLinks.thumbnail}">
            <h4>${book.title}</h4>
            <em>${book.authors ? book.authors.join(", "): ''}</em>
            <button class="drop-btn">^</button>
            <div class="dropdown-spans" data-id="${book.id}" data-current="${shelf}">
                <span data-type="currentlyReading">
                    <span class="checked ${shelf == 'currentlyReading' ? '' : 'hide'}">✔</span>
                    Currently Reading
                </span>
                <span data-type="wantToRead">
                    <span class="checked ${shelf == 'wantToRead' ? '' : 'hide'}">✔</span>
                    Want to Read
                </span>
                <span data-type="read">
                    <span class="checked ${shelf == 'read' ? '' : 'hide'}">✔</span>
                    Read
                </span>
                <span data-type="none">
                    <span class="checked ${shelf == 'none' ? '' : 'hide'}">✔</span>
                    None
                </span>
            </div>
        </li>
        `
    }).join("")}</ul>`
    
}

function buildShelf(title, ul) {
    return `
    <div class="shelf">
        <h3>
            ${title}
        </h3>
        ${ul}
        <hr>
    </div>
    `
}


loadShelves()