const params = (new URL(document.location)).searchParams;
const code = params.get("code");



let nextQuestion = (qnum,q,c1,c2,c3,c4) =>{
  document.getElementById('qnum').innerHTML = qnum; 
  document.getElementById('question').innerHTML = q; 
  document.getElementById('c-1').innerHTML = c1; 
  document.getElementById('c-2').innerHTML = c2;
  document.getElementById('c-3').innerHTML = c3;
  document.getElementById('c-4').innerHTML = c4;
}