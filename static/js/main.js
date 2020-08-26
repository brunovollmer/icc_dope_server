$(document).ready(function() {
    var master_results = [];

    window.setInterval(function () {
        var elem = document.getElementById('data-channel');
        elem.scrollTop = elem.scrollHeight;
    }, 200);


    var optionsHidden = true;

    $('#overlay-btn').click(function () {
        $('#overlay').slideToggle();
        if (optionsHidden) {
            $('#overlay-btn').text("Optionen verbergen");
            optionsHidden = false;
        } else {
            $('#overlay-btn').text("Optionen");
            optionsHidden = true
        }
    });

    $('#stop').click(function () {
        $('#start').show();
    });

    $('#switch').click(function () {
        $('#leftVideo').toggle();
        $('#leftPlot').toggle();
        $('#rightVideo').toggle();
        $('#rightPlot').toggle();
    });

    $("#video_form").submit(function(e) {
        $("#loader").css("display", "block");
        $("#loading_overlay").css("display", "block");
        e.preventDefault();
        var form = $("#video_form")[0]
        var formData = new FormData(form);
        $.ajax({
            type: "POST",
            url: "/video",
            processData: false,
            contentType: false,
            data: formData,
            success: function(msg) {
                master_results = JSON.parse(msg);

                $("#loader").css("display", "none");
                $("#loading_overlay").css("display", "none");


                 // // preview of uploaded video
    // document.querySelector("input[type=file]").onchange = function(event) {
    //     document.getElementById('media').style.display = 'block';
    //     let file = event.target.files[0];
    //     let blobURL = URL.createObjectURL(file);
    //     var canvas = document.getElementById("master_canvas");
    //     drawVideoOnCanvas(canvas, blobURL, "master_video");
    //     //document.querySelector("video").src = blobURL;
    // }

            },
            error: function(msg) {
                console.log('failure');

                $("#loader").css("display", "none");
                $("#loading_overlay").css("display", "none");
                alert("FEHLER!")
            }
        });
    });

    //used to set the height of the options overlay
    var overlayHeight = $("#overlay").get(0).scrollHeight;
    $(".footer").hover(function(){
        $(".overlay").css("height", overlayHeight + "px");
    });

    $(".overlay").hover(function(){
    }, function(){
        $(".overlay").css("height", "0%");
    });


    //both divs are visible
    var slideStatus = 0;
    var leftDiv =  $('#leftDiv');
    var rightDiv =  $('#rightDiv');
    var slideLeft = $('#slideLeft');
    var slideRight = $('#slideRight');
    var slideDiv = $('#viewToggle');

    slideLeft.click(function () {
        if(slideStatus === 0){
            //set right div to fullscreen
            leftDiv.hide();
            slideLeft.hide();
            slideDiv.css("right", "100%");
            slideStatus = -1;
        } else if(slideStatus === 1){
            //set both divs to visible
            rightDiv.show();
            slideRight.show();
            slideDiv.css("left", "0%");
            slideStatus = 0;
        }
        adjustCanvasSize();
    });

    slideRight.click(function () {
        if(slideStatus === 0){
            //set right div to fullscreen
            rightDiv.hide();
            slideRight.hide();
            slideDiv.css("left", "95%");
            slideStatus = 1;
        } else if(slideStatus === -1){
            //set both divs to visible
            leftDiv.show();
            slideDiv.css("right", "0%");
            slideLeft.show();
            slideStatus = 0;
        }
        adjustCanvasSize();
    });
});