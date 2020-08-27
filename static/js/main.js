$(document).ready(function() {

    create_3d_plot('container', '#slider', test_poses_3d)

    var autoScroll = null;
    $("#toggle-autoscroll").click(function() {
        if(autoScroll) {
            clearInterval(autoScroll);
            autoScroll = null;
        } else {
            autoScroll = setInterval(function () {
                var elem = document.getElementById('data-channel');
                elem.scrollTop = elem.scrollHeight;
            }, 200);
        }
    });

    // preview of uploaded video
    document.querySelector("input[type=file]").onchange = function(event) {
        document.getElementById('media').style.display = 'block';
        let file = event.target.files[0];
        let blobURL = URL.createObjectURL(file);
        var canvas = document.getElementById("master_canvas");
        drawVideoOnCanvas(canvas, blobURL, "master_video");
        //document.querySelector("video").src = blobURL;
    }


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
        $('#animationSliderDiv').toggle();
        adjustPlotSize();
        showFooter(true);
    });

    $("#video_form").submit(function(e) {
        console.log("SUBMIT")
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

                updateMasterPoseList(master_results)

                $("#loader").css("display", "none");
                $("#loading_overlay").css("display", "none");

                startVideo();
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
    $(".footer").hover(function(){
        showFooter(true);
    });

    $(".overlay").hover(function(){
    }, function(){
        showFooter(false);
    });

    function showFooter($show) {
        if($show){
            overlayHeight = $("#overlay").get(0).scrollHeight;
            $(".overlay").css("height", overlayHeight + "px");
        } else {
            $(".overlay").css("height", "0%");
        }
    }


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
        //adjustCanvasSize();
        adjustPlotSize();
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
        //adjustCanvasSize();
        adjustPlotSize();
    });

    $(".custom-file-input").on("change", function() {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });
});