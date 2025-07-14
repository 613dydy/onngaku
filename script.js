let player;
let playlist = [];
let currentFolder = "";
let allFolders = [];

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

    const playBtn = document.createElement("button");
    playBtn.textContent = "▶";
    playBtn.onclick = () => player.loadVideoById(item.id);

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.onclick = () => deleteVideo(item.id);

    li.textContent = item.title + " ";
    li.appendChild(playBtn);
    li.appendChild(delBtn);
    ul.appendChild(li);
  });

  new Sortable(ul, {
    animation: 150,
    onEnd: () => {
      const newList = [];
      document.querySelectorAll("#playlist li").forEach(li => {
        const title = li.firstChild.textContent.trim();
        const item = playlist.find(p => p.title === title);
        if (item) newList.push(item);
      });
      playlist = newList;
    }
  });
}

function extractVideoId(url) {
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
  const match = url.match(regExp);
  return match ? match[1] : '';
}

async function addVideo() {
  const url = document.getElementById("youtubeInput").value;
  const videoId = extractVideoId(url);
  if (!videoId) return alert("有効なYouTube URLを入力してください");

  const title = `動画ID: ${videoId}`;
  playlist.push({ id: videoId, title });

  try {
    await saveVideo(videoId, title);
    updatePlaylistUI();
    if (playlist.length === 1) {
      player.loadVideoById(videoId);
    }
  } catch (err) {
    alert("保存に失敗しました。コンソールを確認してください。");
    console.error("Firebase保存エラー:", err);
  }
}

async function saveVideo(videoId, title) {
  const ref = window.collection(window.db, "playlists");
  await window.addDoc(ref, {
    sharedId: "a",
    folder: currentFolder || "default",
    videoId,
    title
  });
}

async function deleteVideo(videoId) {
  const ref = window.collection(window.db, "playlists");
  const snapshot = await window.getDocs(ref);
  snapshot.forEach(async (doc) => {
    const data = doc.data();
    if (
      data.sharedId === "a" &&
      (data.folder || "default") === currentFolder &&
      data.videoId === videoId
    ) {
      const docRef = doc.ref;
      await window.deleteDoc(docRef);
    }
  });

  // 再読み込み
  playlist = playlist.filter(item => item.id !== videoId);
  updatePlaylistUI();
}

async function loadVideos() {
  playlist = [];
  const ref = window.collection(window.db, "playlists");
  const snapshot = await window.getDocs(ref);
  const folders = new Set();
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.sharedId === "a") {
      folders.add(data.folder || "default");
      if ((data.folder || "default") === currentFolder) {
        playlist.push({ id: data.videoId, title: data.title });
      }
    }
  });
  allFolders = Array.from(folders);
  if (!currentFolder) {
    currentFolder = allFolders[0] || "default";
  }
  updateFolderUI();
  updatePlaylistUI();
  if (playlist.length > 0) {
    player.loadVideoById(playlist[0].id);
  }
}

function createFolder() {
  const name = document.getElementById("newFolderInput").value.trim();
  if (name && !allFolders.includes(name)) {
    allFolders.push(name);
    currentFolder = name;
    updateFolderUI();
    localStorage.setItem("currentFolder", name);
    playlist = [];
    updatePlaylistUI();
  }
}

function updateFolderUI() {
  const select = document.getElementById("folderSelect");
  select.innerHTML = "";
  allFolders.forEach(folder => {
    const opt = document.createElement("option");
    opt.value = folder;
    opt.textContent = folder;
    if (folder === currentFolder) opt.selected = true;
    select.appendChild(opt);
  });
}

function changeFolder() {
  const folder = document.getElementById("folderSelect").value;
  currentFolder = folder;
  localStorage.setItem("currentFolder", folder);
  playlist = [];
  loadVideos();
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

window.onload = () => {
  currentFolder = localStorage.getItem("currentFolder") || "";
  loadVideos();
};
