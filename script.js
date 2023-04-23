$('#home').scrollIntoView({
  behavior: 'instant',
  inline: 'center'
});

function drawDailyChart(x) {
  let data = google.visualization.arrayToDataTable(x);
  let chart = new google.visualization.ColumnChart($('#daily-chart>.chart'));
  chart.draw(data, {
    backgroundColor: 'transparent',
    legend: {
      position: 'none'
    },
    animation: {
      duration: 1000,
      startup: true,
      easing: 'easeOut'
    },
    fontName: 'Oswald',
    hAxis: {
      textStyle: {
        color: '#e3e3e3'
      }
    }
  });
}

async function drawLeaderboard(x) {
  console.log(x);
  for (let i = 0; i < Object.keys(x).length && i < 5; i++) {
    const liElm = document.createElement('li');
    let src = await FIREBASE.db.collection('user-data').doc(Object.keys(x)[i]).get();
    console.log(Object.keys(x)[i], src);
    src = await src.data();
    liElm.innerHTML = `<img src="${src.photoURL}">
                        <div class="name">${src.displayName ?? 'user'}</div>
                        <div class="calories">${Object.values(x)[i]}</div>`
    
    $('#leaderboard>.chart').appendChild(liElm);

  }
}

async function updateCharts() {
  let doc = await FIREBASE.db.collection("caloriemeter").doc(FIREBASE.user.uid).get()
  doc = await doc.data()
  const chartData = [["Day", "Calories", { role: 'style' }]];
  for (const property in doc) {
    chartData.push([property.slice(property.length - 2, property.length), doc[property].Burnt, (doc[property].Burnt > doc[property].Goal) ? '#4dbf4d' : ((doc[property].Burnt > doc[property].Min) ? '#54c7ec' : '#fa383e')])
  }
  drawDailyChart(chartData)

  let docs = await FIREBASE.db.collection("caloriemeter").get();
  const leaderboardData = {};
  await docs.forEach(async doc => {
    const id = doc.id;
    doc = await doc.data();
    Object.entries(doc).forEach(x => {
      leaderboardData[id] = leaderboardData[id] >= 0 ? leaderboardData[id] + x[1].Burnt : 0;
    })
  })
  const sortedLeaderboardData = Object.fromEntries(Object.entries(leaderboardData).sort(([,a],[,b]) => b - a))
  drawLeaderboard(sortedLeaderboardData);
}

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    FIREBASE.user = user;
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(updateCharts);
  }
  else
    window.location.href = window.location.origin + "/login"
})

// Ambient music

let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

let track_index = 0;
let isPlaying = false;
let updateTimer;

// Create new audio element
let curr_track = document.createElement('audio');

// Define the tracks that have to be played
let track_list = [
  {
    name: "Night Owl",
    artist: "Broke For Free",
    image: "https://images.pexels.com/photos/2264753/pexels-photo-2264753.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=250&w=250",
    path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3"
  },
  {
    name: "Enthusiast",
    artist: "Tours",
    image: "https://images.pexels.com/photos/3100835/pexels-photo-3100835.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=250&w=250",
    path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3"
  },
  {
    name: "Shipping Lanes",
    artist: "Chad Crouch",
    image: "https://images.pexels.com/photos/1717969/pexels-photo-1717969.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=250&w=250",
    path: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Shipping_Lanes.mp3",
  },
  {
    name: "Workout",
    artist: "advaita",
    image: "https://images.pexels.com/photos/1717969/pexels-photo-1717969.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=250&w=250",
    path: "https://github.com/Advaita151/Git-tutorial/raw/master/Richard%20Jonas%20-%20Impulse%20Workout.mp3",
  },

];

function random_bg_color() {

  // Get a number between 64 to 256 (for getting lighter colors)
  let red = Math.floor(Math.random() * 256) + 64;
  let green = Math.floor(Math.random() * 256) + 64;
  let blue = Math.floor(Math.random() * 256) + 64;

  // Construct a color withe the given values
  let bgColor = "rgb(" + red + "," + green + "," + blue + ")";

  // Set the background to that color
  console.log(bgColor);
  $('#music').style.setProperty('--theme-color', bgColor);
}

function loadTrack(track_index) {
  clearInterval(updateTimer);
  resetValues();
  curr_track.src = track_list[track_index].path;
  curr_track.load();

  track_art.style.backgroundImage = "url(" + track_list[track_index].image + ")";
  track_name.textContent = track_list[track_index].name;
  track_artist.textContent = track_list[track_index].artist;
  now_playing.textContent = "PLAYING " + (track_index + 1) + " OF " + track_list.length;

  updateTimer = setInterval(seekUpdate, 1000);
  curr_track.addEventListener("ended", nextTrack);
  random_bg_color();
}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

// Load the first track in the tracklist
loadTrack(track_index);

function playpauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  curr_track.play();
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="material-symbols-outlined">pause_circle</i>';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="material-symbols-outlined">play_circle</i>';;
}

function nextTrack() {
  if (track_index < track_list.length - 1)
    track_index += 1;
  else track_index = 0;
  loadTrack(track_index);
  playTrack();
}

function prevTrack() {
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length;
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  let seekto = curr_track.duration * (seek_slider.value / 200);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 200;
}

function seekUpdate() {
  let seekPosition = 0;

  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (200 / curr_track.duration);

    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}