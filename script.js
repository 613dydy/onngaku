let player;
let playlist = [];

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '300',
    width: '100%',
    videoId: '',
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    playNextVideo();
  }
}

function playNextVideo() {
  playlist.shift();
  updatePlaylistUI();
  if (playlist.length > 0) {
    player.loadVideoById(playlist[0].id);
  }
}

function updatePlaylistUI() {
  const ul = document.getElementById("playlist");
  ul.innerHTML = "";
  playlist.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.title;
    ul.appendChild(li);
  });

  new Sortable(ul, {
    animation: 150,
    onEnd: function () {
      const newPlaylist = [];
      document.querySelectorAll("#playlist li").forEach(li => {
        const title = li.textContent;
        const item = playlist.find(p => p.title === title);
        if (item) newPlaylist.push(item);
      });
      playlist = newPlaylist;
    }
  });
}

function extractVideoId(url) {
  const match = url.match(/v=([^&]+)/);
  return match ? match[1] : '';
}

async function addVideo() {
  const url = document.getElementById("youtubeInput").value;
  const videoId = extractVideoId(url);
  const title = `動画ID: ${videoId}`;
  playlist.push({ id: videoId, title });

  await saveVideoToFirebase(videoId, title);
  updatePlaylistUI();
  if (playlist.length === 1) {
    player.loadVideoById(videoId);
  }
}

async function saveVideoToFirebase(videoId, title) {
  const ref = collection(window.db, "playlists");
  await addDoc(ref, {
    uid: window.uid,
    videoId,
    title
  });
}

async function loadVideos() {
  const ref = collection(window.db, "playlists");
  const q = query(ref, where("uid", "==", window.uid));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    const data = doc.data();
    playlist.push({ id: data.videoId, title: data.title });
  });
  updatePlaylistUI();
  if (playlist.length > 0) {
    player.loadVideoById(playlist[0].id);
  }
}

function shufflePlaylist() {
  for (let i = playlist.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
  }
  updatePlaylistUI();
  if (playlist.length > 0) {
    player.loadVideoById(playlist[0].id);
  }
}
