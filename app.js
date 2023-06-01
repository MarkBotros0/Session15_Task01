var eventsMediator = {
    events: {},
    on: function (eventName, callbackfn) {
        this.events[eventName] = this.events[eventName]
            ? this.events[eventName]
            : [];
        this.events[eventName].push(callbackfn);
    },
    emit: function (eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (callBackfn) {
                callBackfn(data);
            });
        }
    },
};


var modalModule = {
    init() {
        eventsMediator.on("modal.opened", function (data) { modalModule.openModal(data) })
    },
    openModal({ name, rating, img, desc }) {
        $(".my-modal-view").toggleClass("d-none")
        $(".movie-name").text(name)
        $(".movie-rate").text("IMDB Rating: " + rating + "/10")
        $(".movie-desc").text(desc)
        $(".movie-img").attr("src", img)
        console.log(img)
    }, closeModal() {
        $(".my-modal-view").toggleClass("d-none")
    }
}

var statsModule = {
    currentPage: 1,
    numberOfMovies: 20,
    topRatedMovie: {
        movieName: "",
        rating: "",
    },
    init() {
        eventsMediator.on("movies.loaded", function (numberOfMovies) {
            statsModule.numberOfMovies = numberOfMovies
            statsModule.render()
        })
        eventsMediator.on("topRated.update", function (bestRatingMovie) {
            statsModule.topRatedMovie.movieName = bestRatingMovie.original_title
            statsModule.topRatedMovie.rating = bestRatingMovie.vote_average
        })
        this.render()
    }, render() {
        $(".curr-page").text("Current Page: " + this.currentPage)
        $(".number").text("Number of Movies: " + this.numberOfMovies)
        $(".top-rated").text("Top rated movie: " + this.topRatedMovie.movieName)
        $(".rating").text("Rating: " + this.topRatedMovie.rating)
    }
}

var moviesModule = {
    movies: [],
    page: 1,
    init() {
        this.fetchMovies()
    },
    fetchMovies() {
        $.ajax({
            url: `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${moviesModule.page}`,
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMTQ2MzgxMDgzNzliODFjZWNiYTE4ZmI4MDMzZTBiNSIsInN1YiI6IjY0NzczZTc3MDA1MDhhMDExNmQ1NTViNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5aEDM2F7O2mNwqxa-ktSn9xPYzgqNlL-KLaNEyHQxfg'
            }, success: function (result) {
                $(".myloader").toggleClass("d-none");
                moviesModule.movies = result.results
                moviesModule.render()
                moviesModule.getBestRating()
                eventsMediator.emit("movies.loaded", moviesModule.movies.length);
            }
        });
    }, getBestRating() {
        const bestRatingMovie = moviesModule.movies.reduce(
            (prev, current) => {
                return prev.vote_average > current.vote_average ? prev : current
            })
        eventsMediator.emit("topRated.update", bestRatingMovie);
    },
    render() {
        $(".my-grid").html("")
        for (let i = 0; i < this.movies.length; i++) {
            let movie = this.movies[i]
            let imgUrl = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2/${movie.poster_path}`
            $(".my-grid").append(
                `<div class=" card card${i}">
                    <img src="${imgUrl}" class="img-fluid card-img-top">
                    <div class="card-body text-center">
                        <h6>${movie.original_title}</h6>
                        <h6>${movie.vote_average}</h6>
                    </div>
                </div>`)

            $(".card" + i).on('click', function () {
                eventsMediator.emit("modal.opened", { name: movie.original_title, rating: movie.vote_average, img: imgUrl, desc: movie.overview });

            });
        }

    }
}


$(document).ready(function () {
    $(".nextBtn").on('click', function () {
        $(".myloader").toggleClass("d-none");
        moviesModule.page++
        statsModule.currentPage++
        moviesModule.fetchMovies()
    })
    $(".prevBtn").on('click', function () {
        if (moviesModule.page > 1) {
            $(".myloader").toggleClass("d-none");
            moviesModule.page--
            statsModule.currentPage--
        }
        moviesModule.fetchMovies()
    })
    $("#close-btn").on('click', function () {
        modalModule.closeModal()
    });

    statsModule.init()
    moviesModule.init()
    modalModule.init()


});


