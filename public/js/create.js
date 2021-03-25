let redirect = (site) =>{
  window.location.href = site;
}



send = (title, num_of_questions) => {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/create2", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
      Title: title,
      noq: num_of_questions,
      part2: true,
  }));
};

