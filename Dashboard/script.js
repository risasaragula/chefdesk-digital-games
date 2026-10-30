
const games = [
  {
    name: "Spin the Wheel",
    category: "Luck",
    description: "Give it a spin. See what's next.",
    image: "assets/spin.webp",
    link: "../spinthewheel/index.html"
  },
  {
    name: "Scratch & Win",
    category: "Luck",
    description: "Scratch to reveal what's inside.",
    image: "assets/scratch.webp",
    link: "../Scratch Card/index.html"
  },
  {
    name: "Foodie Quiz",
    category: "Quiz",
    description: "How well do you know your food?",
    image: "assets/quiz.webp",
    link: "../Foodie Quiz/index.html"
  },
  {
    name: "Tic Tac Toe",
    category: "Classic",
    description: "A quick classic for two players.",
    image: "assets/tic.webp",
    link: "../Tic Tac Toe/index.html"
  },
  {
    name: "Pac-Man",
    category: "Arcade",
    description: "Chase dots. Dodge ghosts. Repeat.",
    image: "assets/space.webp",
    link: "../Pac Man/index.html"
  },
  {
    name: "Sudoku",
    category: "Puzzle",
    description: "A number puzzle at your own pace.",
    image: "assets/numbers.webp",
    link: "../Sudoku/index.html"
  },
  {
    name: "Memory Match",
    category: "Puzzle",
    description: "Find the matching pairs.",
    image: "assets/memory.webp",
    link: "../Memory Match/index.html"
  },
  {
    name: "Collect & Win",
    category: "Luck",
    description: "Collect food favorites and win.",
    image: "assets/trophy.webp",
    link: "../Collect & Win/index.html"
  },
  {
    name: "Draw & Guess",
    category: "Classic",
    description: "Draw a food clue. Guess with friends.",
    image: "assets/quiz.webp",
    link: "../Draw & Guess/index.html"
  }
];

const gamesGrid = document.getElementById("gamesGrid");
const searchInput = document.getElementById("searchInput");
const noGames = document.getElementById("noGames");

let currentCategory = "All";

function renderGames() {
  const query = searchInput.value.toLowerCase().trim();

  const filteredGames = games.filter(game => {
    const matchesCategory =
      currentCategory === "All" ||
      game.category === currentCategory;

    const matchesSearch =
      game.name.toLowerCase().includes(query) ||
      game.description.toLowerCase().includes(query) ||
      game.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  gamesGrid.innerHTML = "";

  filteredGames.forEach(game => {
    const card = document.createElement("a");
    card.className = "game-card";
    card.href = game.link;

    card.innerHTML = `
      <div class="game-image">
        <img src="${game.image}" alt="${game.name}" loading="lazy">
        <span class="category ${game.category}">
          ${game.category}
        </span>
      </div>

      <div class="game-info">
        <div class="game-title-row">
          <div>
            <h3>${game.name}</h3>
            <p>${game.description}</p>
          </div>
          <span class="round-arrow">›</span>
        </div>

        <span class="play-button">
          Play now &nbsp; →
        </span>
      </div>
    `;

    gamesGrid.appendChild(card);
  });

  noGames.hidden = filteredGames.length > 0;
}

// SEARCH
searchInput.addEventListener("input", renderGames);

// CATEGORY FILTERS
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    currentCategory = button.dataset.filter;

    renderGames();
  });
});

// GRID VIEW
document.getElementById("gridBtn").addEventListener("click", () => {
  gamesGrid.classList.remove("list-view");

  document.getElementById("gridBtn").classList.add("active");
  document.getElementById("listBtn").classList.remove("active");
});

// LIST VIEW
document.getElementById("listBtn").addEventListener("click", () => {
  gamesGrid.classList.add("list-view");

  document.getElementById("listBtn").classList.add("active");
  document.getElementById("gridBtn").classList.remove("active");
});

// INITIAL LOAD
renderGames();
