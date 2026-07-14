// ===== DOM ELEMENTS =====
const audio = document.getElementById("audio-player");
const playPauseBtn = document.getElementById("play-pause");
const prevBtn = document.getElementById("prev-track");
const nextBtn = document.getElementById("next-track");
const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");
const songTitle = document.getElementById("track-title");
const songArtist = document.getElementById("track-artist");
const lyricsDisplay = document.getElementById("lyrics-display");
const lyricsBg = document.getElementById("lyrics-bg");
const playerCover = document.getElementById("player-cover");
const cards = document.querySelectorAll(".song-card");
const searchInput = document.getElementById("searchInput");
const progressBar = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");
const volumeSlider = document.getElementById("volume-slider");
const muteBtn = document.getElementById("mute-btn");
const likeBtn = document.querySelector(".like-btn");

// ===== STATE =====
let currentSong = 0;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0;
let lastVolume = 70;
const songs = [];
let likedSongs = JSON.parse(localStorage.getItem("likedSongs") || "[]");

// ===== LOAD SONGS FROM HTML =====
cards.forEach(card => {
  songs.push({
    title: card.dataset.title,
    artist: card.dataset.artist,
    src: card.dataset.src,
    lyrics: card.dataset.lyrics || "No lyrics available.",
    image: card.querySelector("img").src
  });
});

// ===== UPDATE ACTIVE CARD =====
function updateActiveCard() {
  cards.forEach((card, index) => {
    card.classList.toggle("active", index === currentSong);
  });
}

// ===== UPDATE LIKE STATE =====
function updateLikeState() {
  const currentId = songs[currentSong].src;
  likeBtn.innerHTML = likedSongs.includes(currentId)
    ? '<i class="fas fa-heart"></i>'
    : '<i class="far fa-heart"></i>';
}

// ===== LOAD SONG =====
function loadSong(index) {
  if (songs.length === 0) {
    console.error("No songs found! Check your data-src paths.");
    return;
  }
  
  currentSong = index;
  audio.src = songs[index].src;
  songTitle.textContent = songs[index].title;
  songArtist.textContent = songs[index].artist;
  lyricsDisplay.textContent = songs[index].lyrics;
  lyricsBg.style.backgroundImage = `url(${songs[index].image})`;
  playerCover.src = songs[index].image;
  updateActiveCard();
  updateLikeState();
  
  progressFill.style.width = "0%";
  currentTimeEl.textContent = "0:00";
}

// ===== PLAY / PAUSE =====
function playSong() {
  audio.play()
    .then(() => {
      isPlaying = true;
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      console.log("Now playing:", songs[currentSong].title);
    })
    .catch(err => {
      console.error("Playback error:", err, "Check your MP3 path!");
      alert("Could not play song — check your file path or use Live Server!");
    });
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
}

// ===== SHUFFLE & REPEAT =====
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

repeatBtn.addEventListener("click", () => {
  repeatMode = (repeatMode + 1) % 3;
  updateRepeatIcon();
});

function updateRepeatIcon() {
  repeatBtn.classList.toggle("active", repeatMode !== 0);
  repeatBtn.innerHTML = repeatMode === 2
    ? '<i class="fas fa-repeat-1"></i>'
    : '<i class="fas fa-repeat"></i>';
}

// ===== MAIN CONTROLS =====
playPauseBtn.addEventListener("click", () => {
  if (!audio.src) return;
  isPlaying ? pauseSong() : playSong();
});

nextBtn.addEventListener("click", () => {
  if (isShuffle) {
    let newIdx;
    do { newIdx = Math.floor(Math.random() * songs.length); }
    while (newIdx === currentSong && songs.length > 1);
    currentSong = newIdx;
  } else {
    currentSong = (currentSong + 1) % songs.length;
  }
  loadSong(currentSong);
  playSong();
});

prevBtn.addEventListener("click", () => {
  currentSong = (currentSong - 1 + songs.length) % songs.length;
  loadSong(currentSong);
  playSong();
});

// ===== CARD CLICKS =====
cards.forEach((card, index) => {
  card.addEventListener("click", () => {
    loadSong(index);
    playSong();
  });

  const playCardBtn = card.querySelector(".play-card-btn");
  if (playCardBtn) {
    playCardBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      loadSong(index);
      playSong();
    });
  }
});

// ===== SONG END =====
audio.addEventListener("ended", () => {
  if (repeatMode === 2) {
    audio.currentTime = 0;
    playSong();
  } else if (repeatMode === 1 || currentSong < songs.length - 1) {
    nextBtn.click();
  } else {
    pauseSong();
  }
});

// ===== PROGRESS BAR =====
audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${progress}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
});

audio.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = formatTime(audio.duration);
});

progressBar.addEventListener("click", (e) => {
  if (!audio.src) return;
  const seek = (e.offsetX / progressBar.clientWidth) * audio.duration;
  audio.currentTime = seek;
});

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ===== VOLUME & MUTE =====
audio.volume = volumeSlider.value / 100;

volumeSlider.addEventListener("input", (e) => {
  const vol = e.target.value / 100;
  audio.volume = vol;
  lastVolume = e.target.value;
  updateVolumeIcon(vol);
});

muteBtn.addEventListener("click", () => {
  if (audio.volume > 0) {
    lastVolume = volumeSlider.value;
    volumeSlider.value = 0;
    audio.volume = 0;
  } else {
    volumeSlider.value = lastVolume;
    audio.volume = lastVolume / 100;
  }
  updateVolumeIcon(audio.volume);
});

function updateVolumeIcon(vol) {
  muteBtn.innerHTML = vol === 0
    ? '<i class="fas fa-volume-xmark"></i>'
    : vol < 0.5
      ? '<i class="fas fa-volume-low"></i>'
      : '<i class="fas fa-volume-high"></i>';
}

// ===== LIKE BUTTON =====
likeBtn.addEventListener("click", () => {
  const currentId = songs[currentSong].src;
  likedSongs = likedSongs.includes(currentId)
    ? likedSongs.filter(id => id !== currentId)
    : [...likedSongs, currentId];
  localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
  updateLikeState();
});

// ===== SEARCH =====
searchInput.addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase().trim();
  cards.forEach(card => {
    const title = card.dataset.title.toLowerCase();
    const artist = card.dataset.artist.toLowerCase();
    card.style.display = (title.includes(keyword) || artist.includes(keyword)) ? "" : "none";
  });
});

// ===== INITIALIZE =====
if (songs.length > 0) {
  loadSong(0);
} else {
  songTitle.textContent = "No songs found";
  songArtist.textContent = "Check your Music folder paths";
}