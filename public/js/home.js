
let redirect = (site) =>{
  window.location.href = site;
}

// Animation Crap

let Play = ()=>{
    var play = document.getElementById("play");
    play.style.display = "block";
};

let p = (user) => {
  redirect(`/player?code=${document.getElementById('code').value}`);
}


let About = () =>{
  redirect('/about')
}


let hide = () =>{
  clearInterval(setInterval("hide()",1000))
  var play = document.getElementById("play");
  play.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  var play = document.getElementById("play");
  if (event.target == play) {
    play.style.animation = "come-put 1s";
    hide()
  }
}