import {get, getAll, update, search } from './BooksAPI.js'

let flag = true

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
    await update(bookId, shelf)
    if (flag) {
        loadShelves()
    }
}

function activateListeners() {
    const dropBtns = document.querySelectorAll(".drop-btn")
    if (flag) {
        const addBtn = document.querySelector('.add')
        addBtn.addEventListener('click', switchMode)
    }
    dropBtns.forEach(dropBtn => {
        dropBtn.addEventListener("click", dropBtnClick)
    })
}

function switchMode(e) {
    flag = !flag
    if (flag) {
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

function buildUl(data) {
    return `<ul>${data.map((book) => {
        const type = book.shelf
        return `
        <li>
            <img src="${book.imageLinks.thumbnail}">
            <h4>${book.title}</h4>
            <em>${book.authors ? book.authors.join(", "): ''}</em>
            <button class="drop-btn">^</button>
            <div class="dropdown-spans" data-id="${book.id}" data-current="${type}">
                <span data-type="currentlyReading">
                    <span class="checked ${type == 'currentlyReading' ? '' : 'hide'}">✔</span>
                    Currently Reading
                </span>
                <span data-type="wantToRead">
                    <span class="checked ${type == 'wantToRead' ? '' : 'hide'}">✔</span>
                    Want to Read
                </span>
                <span data-type="read">
                    <span class="checked ${type == 'read' ? '' : 'hide'}">✔</span>
                    Read
                </span>
                <span data-type="none">
                    <span class="checked ${type == 'none' ? '' : 'hide'}">✔</span>
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