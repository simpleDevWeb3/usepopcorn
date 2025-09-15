import { use, useEffect, useState } from "react";
import StarRating from "./StarRating";

const API_KEY = "135db5ce";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      setIsLoading(true);
      setError("");

      try {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`,
          { signal: controller.signal }
        );
        if (!res.ok)
          throw new Error("Something went wrong with fetching movie");

        const data = await res.json();

        if (data.Response === "False") throw new Error("Movie not found");

        setMovies(data.Search);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }
    handleCloseMovie();
    fetchMovies();

    return function () {
      controller.abort();
    };
  }, [query]);

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <Logo />
        <SearchBar query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/*isLoading ? <Loader /> : <MovieList movies={movies} />*/}
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <MovieList
              movies={movies}
              onSelectMovie={handleSelectMovie}
              selectedId={selectedId}
            />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              handleCloseMovie={handleCloseMovie}
              handleAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <MovieSummary watched={watched} />
              <WatchedList movies={watched} onDelete={handleDeleteWatched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔️</span> {message}
    </p>
  );
}

//Main View
function Main({ children }) {
  return <main className="main">{children}</main>;
}

//Navigation Section
function SearchBar({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

//Reusable Component For Searchbox and WatchBox

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
function MovieList({ movies, onSelectMovie, selectedId }) {
  function handleSelectMovie(movie) {
    onSelectMovie(movie.imdbID);
  }
  return (
    <ul className="list list-movies">
      {movies.map((movie) => (
        <Movie
          key={movie.imdbID}
          movie={movie}
          onSelectMovie={handleSelectMovie}
          selectedId={selectedId}
        ></Movie>
      ))}
    </ul>
  );
}

function WatchedList({ movies, onDelete }) {
  return (
    <ul className="list">
      {movies.map((movie) => (
        <WatchedMovie
          key={movie.imdbID}
          movie={movie}
          onClickDel={onDelete}
        ></WatchedMovie>
      ))}
    </ul>
  );
}
function Movie({ movie, onSelectMovie, selectedId }) {
  const selected = selectedId;
  return (
    <li
      style={selected === movie.imdbID ? { backgroundColor: "#a39a9a1f" } : {}}
      key={movie.imdbID}
      onClick={() => onSelectMovie(movie)}
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <p>
        <span>🗓</span>
        <span>{movie.Year}</span>
      </p>
    </li>
  );
}
function MovieDetails({
  selectedId,
  handleCloseMovie,
  handleAddWatched,
  watched,
}) {
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [error, setError] = useState("");

  const isWatched = watched.find((movie) => movie.imdbID === selectedId)
    ? true
    : false;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie || {};

  useEffect(() => {
    async function fetchMovieDetails() {
      if (!selectedId) return;
      setIsLoading(true);
      setError("");

      try {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${API_KEY}&i=${selectedId}`
        );

        if (!res.ok)
          throw new Error("Something went wrong with fetching movie details");

        const data = await res.json();
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    function callBack(e) {
      if (e.code === "Escape") {
        handleCloseMovie();
      }
    }
    document.addEventListener("keydown", callBack);

    return function () {
      document.removeEventListener("keydown", callBack);
    };
  }, [handleCloseMovie]);

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;

    return function () {
      document.title = "usePopcorn";
    };
  }, [title]);

  function onAddWatched() {
    const newWathcedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    handleAddWatched(newWathcedMovie);
    handleCloseMovie();
  }

  return (
    <>
      {error && <ErrorMessage message={error} />}

      {!error &&
        (isLoading ? (
          <Loader />
        ) : (
          <div className="details">
            <header>
              <button className="btn-back" onClick={handleCloseMovie}>
                &larr;
              </button>
              <img src={poster} alt={`${title}} poster`} />
              <div className="details-overview">
                <h2>{title}</h2>
                <p>
                  <span>{year}</span>
                  {" • "}
                  <span>{runtime}</span>
                </p>
                {genre}
                <p>⭐{imdbRating} IMDb rating</p>
              </div>
            </header>

            <section>
              <div className="rating">
                <StarRating
                  maxRating={10}
                  size={24}
                  defaultRating={
                    watched.find((movie) => movie.imdbID === selectedId)
                      ?.userRating || 0
                  }
                  onSetRating={setUserRating}
                  readOnly={isWatched}
                />
                {userRating > 0 && (
                  <button
                    disabled={isWatched}
                    className="btn-add"
                    onClick={onAddWatched}
                  >
                    +Add to list
                  </button>
                )}
              </div>

              <p>
                <em>{plot}</em>
              </p>
              <p>Starring {actors}</p>
              <p>Directed by {director}</p>
            </section>
          </div>
        ))}
    </>
  );
}
function WatchedMovie({ movie, onClickDel }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>

      <p>
        ⭐️ {movie.imdbRating} &nbsp; 🌟 {movie.userRating} &nbsp; ⏳{" "}
        {movie.runtime} min
      </p>
      <button className="btn-delete" onClick={() => onClickDel(movie.imdbID)}>
        X
      </button>
    </li>
  );
}

function MovieSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>🍿</span>
          <span>{watched.length}</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}
