console.log("Lets write javascript")
let songs;
let currFolder;
let currentSong=new Audio();
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currFolder=folder;
    let a = await fetch(`/songs/`)
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

       // Show all the songs in playlists
       let songUL=document.querySelector(".songList").getElementsByTagName("ul")[0]
       songUL.innerHTML=""
       for (const song of songs) {
           songUL.innerHTML=songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
           <div class="info">
               <div>${song.replaceAll("%20"," ")}</div>
               <div>Himanshu</div>
           </div>
           <div class="playnow">
                <span> Play Now</span>
               <img class="invert" src="img/play.svg" alt="">
           </div>  </li>`;
       }
       //Attach an event listener to each song
      Array.from( document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
       e.addEventListener("click",element=>{
           console.log(e.querySelector(".info").firstElementChild.innerHTML);
               playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
       })
      })
      return songs;
}
const playMusic=(track,pause=false)=>{
    //let audio=new Audio("/songs/"+track)
    currentSong.src=`/${currFolder}/`+track
    if(!pause){
        currentSong.play()
        play.src="img/pause.svg"
    }
    
    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00 / 00:00"

}

async function displayAlbums(){
    //console.log("displaying albums")
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    //console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors= div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    console.log(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        console.log(e);


       if(e.href.includes("/songs/")){ 
       let folder=e.href.split("/").slice(0)[4]
       console.log(folder)

       //Get the meta data of the folder
       let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
       let response = await a.json();
       //console.log(response)
       cardContainer.innerHTML=cardContainer.innerHTML+`<div data-folder="${folder}" class="card ">
       <div  class="play">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 72 72" fill="none">
               <circle cx="36" cy="36" r="34.5" fill="#1ED760" stroke="#1ED760" stroke-width="3"/>
               <path d="M49 36L25 20V52L49 36Z" fill="#FFFFFF"/>
           </svg>
       </div>
       <img src="/songs/${folder}/cover.jpg" alt="mm">
        <h2>${response.title}</h2>
        <p>${response.description}</p>
   </div>`
       }
    }
    // Load the playList whenever the card is clicked
Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click",async item=>{
        songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        playMusic(songs[0]);
    })
})
}

async function main() {
    
    // Get the list of all songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // Display all the albums
    displayAlbums()
 
   // Attach an event listener to play next and previous
   play.addEventListener("click",()=>{
    if(currentSong.paused){
        currentSong.play()
        play.src="img/pause.svg"
        
    }else{
        currentSong.pause()
        play.src="img/play.svg"
    }
   })
   // Listen for timeupdate event
   currentSong.addEventListener("timeupdate",()=>{
    console.log(currentSong.currentTime,currentSong.duration)
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
   })
   // Add an event Listener to seekbar
   document.querySelector(".seekbar").addEventListener("click" ,e=>{
    percent=(e.offsetX/e.target.getBoundingClientRect().width)*100;
  document.querySelector(".circle").style.left=percent+"%";
  currentSong.currentTime=((currentSong.duration)*percent)/100;
   })
   // Add an event listener for hamburger
   document.querySelector(".hamburger").addEventListener("click" , ()=>{
    document.querySelector(".left").style.left="0"
   })
  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click" , ()=>{
    document.querySelector(".left").style.left="-120%"
   })
   // Add an event listener for previous  
   previous.addEventListener("click",()=>{
    console.log("previous clicked")
    let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if((index-1)>=0){
        playMusic(songs[index-1])
    }
   })
   //Add an event listener next
   next.addEventListener("click",()=>{
    console.log("next clicked")
    let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if((index+1)<songs.length){
        playMusic(songs[index+1])
    }
   })
   //Add an event to volume
   document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/ 100")
    currentSong.volume = parseInt(e.target.value) / 100
    if (currentSong.volume >0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
    }
})
 // Add event listener to mute the track
 document.querySelector(".volume>img").addEventListener("click", e=>{ 
    if(e.target.src.includes("img/volume.svg")){
        e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }

})

}
main();