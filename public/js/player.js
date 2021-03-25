var urlParams = new URLSearchParams(window.location.search);
var code = urlParams.get('code');
var qnum = urlParams.get('q');
var user = ("; "+document.cookie).split("; user=").pop().split(";").shift();

let getfirst = () =>{
    const Http = new XMLHttpRequest();
    const url=`http://127.0.0.1/api/quiz?code=${code}`;
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange = (e) => {
        console.log(JSON.parse(Http.responseText))
    }
}
         