const inputEl = document.getElementById("input-el")
const searchBtn = document.getElementById("search-btn")
const searchDiv = document.getElementById("search-div")
const movieListContainer = document.getElementById("movie-list-container")

let searchListHtml = ""
let watchlistIcon = ""
let addOrRemove = ""

let movieSearchIdArray = []
const myWatchlistFromLS = JSON.parse(localStorage.getItem("myWatchlist"))
let watchlistIdArray = []

if (myWatchlistFromLS) {
    watchlistIdArray = myWatchlistFromLS
}

// Main page / no search
movieListContainer.innerHTML = startExploringMessage()

// Watchlist page / render the movies or the empty message
if (location.pathname === "/watchlist.html"){
    if (myWatchlistFromLS) {
        handleWatchlist()
        movieListContainer.style.marginTop = "35px"
    }
    if (watchlistIdArray.length === 0) {
        movieListContainer.innerHTML = emptyWatchlistMessage()
    }
}


// ------ EVENT LISTENERS ------

document.addEventListener("keypress", function(e){
    if (e.key === "Enter") {
        searchListHtml = ""
        handleSearch()
    }
})

document.addEventListener("click", function(e){
    // -- Search button
    if (e.target.dataset.search) {
        searchListHtml = ""
        handleSearch()
    } 
    // -- Add button
    else if (e.target.dataset.add) {
        addToWatchlistArray(e.target.dataset.add)
    }    
    // -- Remove button
    else if (e.target.dataset.remove) {
        removeMovie(e.target.dataset.remove)
    }
})


// ------ REMOVE MOVIE ------

function removeMovie(id) {
    // Delete from Local Storage
    let indexToRemove = watchlistIdArray.indexOf(id)
    let movieToRemove = watchlistIdArray.splice(indexToRemove, 1)
    localStorage.setItem("myWatchlist", JSON.stringify(watchlistIdArray))
    
    // Delete from the Watchlist
    if (location.pathname === "/watchlist.html"){
        if (watchlistIdArray.length === 0) {
            movieListContainer.innerHTML = emptyWatchlistMessage()
        } else {
            searchListHtml = ""
            handleWatchlist()
        }
    }
    // Handle the button's data and icon on the search page
    else {
        let removeMovieBtn = document.getElementById(`btn-${id}`)
        removeMovieBtn.classList.replace("remove-icon", "add-icon")
        removeMovieBtn.setAttribute("data-add", id)
        removeMovieBtn.removeAttribute("data-remove")
    }
}


// ------ ADD MOVIE ------

function addToWatchlistArray(id) {
    // Add movie id to the watchlist and save it to the local storage
    watchlistIdArray.push(id)
    localStorage.setItem("myWatchlist", JSON.stringify(watchlistIdArray))
    
    // Handle the button's data and icon
    let addedMovieBtn = document.getElementById(`btn-${id}`)
    addedMovieBtn.classList.replace("add-icon", "remove-icon")
    addedMovieBtn.setAttribute("data-remove", `${id}`)
    addedMovieBtn.removeAttribute("data-add")
}


// ------ WATCHLIST ------

function handleWatchlist() {
    watchlistIdArray.forEach(movie => getMovieInfo(movie))
}


// ------ SEARCH ------

// Pass found movies to the movieSearchArray / or render the error message
function handleSearch() {
    if (!inputEl.value) {
        movieListContainer.innerHTML = startExploringMessage()
    }
    else {
        fetch(`https://www.omdbapi.com/?apikey=6dcd222a&s=${inputEl.value}`)
        .then(response => response.json())
        .then(data => {
            if (data.Search) {
                movieSearchIdArray = data.Search.map(movie => movie.imdbID)
                movieSearchIdArray.forEach(movie => getMovieInfo(movie))
            }
            else {
                movieListContainer.innerHTML = errorMessage()
            }
        })
    }
}

// Get details of each movie
function getMovieInfo(id) {
    fetch(`https://www.omdbapi.com/?apikey=6dcd222a&i=${id}`)
        .then(response => response.json())
        .then(info => {
            renderMovieList(info)
        })
}

// Render the movie list
function renderMovieList(movie) {    
    const { Poster, Title, imdbRating, Runtime, Genre, Plot, imdbID} = movie
    defineWatchlistIcon(imdbID)
    searchListHtml += `
        <div class="movie">
            <img class="movie-poster" src="${Poster}" >
            <div class="movie-info">
                <div class="movie-info-line">
                    <h3>${Title}</h3>
                    <div class="rating-container">
                        <i class="fa-solid fa-star star-icon"></i>
                        <p class="movie-info-text">${imdbRating}</p>
                    </div>
                </div>
                <div class="movie-info-line">
                    <p>${Runtime}</p>
                    <p>${Genre}</p>
                    <button class="watchlist-btn ${watchlistIcon}" id="btn-${imdbID}" data-${addOrRemove}="${imdbID}">
                        Watchlist
                    </button>
                </div>
                <div class="movie-description">
                    <p>${Plot}</p>
                </div>
            </div>
        </div>
        <div class="divider"></div>
    `
    movieListContainer.innerHTML = searchListHtml
}

// Define the icon ( + / - ) next to the Watchlist button
function defineWatchlistIcon(id) {
    if (myWatchlistFromLS && myWatchlistFromLS.includes(id)) {
        watchlistIcon = "remove-icon"
        addOrRemove = "remove"
    } 
    else {
        watchlistIcon = "add-icon"
        addOrRemove = "add"
    }
}


// ------ MESSAGES ------

function errorMessage() {
    return `<div class="message">
                <p>Unable to find what you’re looking for. Please try another search.</p>
            </div>`
}

function emptyWatchlistMessage() {
    return `<div class="message">
                <p>Your watchlist is looking a little empty...</p>
                <a href="/index.html">
                    <img src="images/add-icon.png" alt="Plus icon in a circle">
                    <p>Let’s add some movies!</p>
                <a/>
            </div>`
}

function startExploringMessage() {
    return `<div class="message">
                <i class="fa-solid fa-film movie-icon"></i>
                <p>Start exploring</p>
            </div>`
}
