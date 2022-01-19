function plusSlides(id, n) {
  $("#" + id).attr('data-pos', parseInt($("#" + id).attr('data-pos')) + n);
  showSlides(id);
}

function currentSlide(id, n) {
  $("#" + id).attr('data-pos', n);
  showSlides(id);
}

function showSlides(id) {
  var i;
  var slides = $("#" + id + " .mySlides");
  var dots = $("#" + id + " .dot");

  var slideIndex = parseInt($("#" + id).attr('data-pos'));
  if (slideIndex > slides.length) {slideIndex = 1}    
  if (slideIndex < 1) {slideIndex = slides.length}
  $("#" + id).attr('data-pos', slideIndex);

  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

function initSlides() {
    $(".slideshow-container").each(function(index) {
        const id = 'slideshow-container-' + (index + 1);
        
        var html = "<a class='prev' onclick='plusSlides(\"" + id + "\"," + "-1)'>&#10094;</a>";
        html += "<a class='next' onclick='plusSlides(\"" + id + "\"," + "1)'>&#10095;</a>";
        html += "<div style='text-align:center'>";
        $(this).find("img").each(function(index) {
            html += "<span class='dot' onclick='currentSlide(\"" + id + "\"," + (index + 1) + ")'></span>";
        });
        html += "</div>";

        $(this).append(html);
        $(this).attr('id', id);

        $(this).attr('data-pos', 1);
        showSlides(id);
    });
}

initSlides();
