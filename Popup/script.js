document.querySelector("#open-popup").addEventListener("click", function(){
     document.body.classList.add("active-popup");
});


document.querySelector("popup .close-btn").addEventListener("click", function(){
  document.body.classList.remove("active-popup");
});