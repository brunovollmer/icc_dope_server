$(document).ready(function() {

    var masterBlob;

    // create_3d_plot('container', '#slider', test_poses_3d)

    // preview of uploaded video
    document.querySelector("input[type=file]").onchange = function(event) {
        document.getElementById('media').style.display = 'block';

        var masterVideo = document.getElementById("masterVideo");

        let file = event.target.files[0];
        let blobURL = URL.createObjectURL(file);
        masterBlob = blobURL;
        masterVideo.src = blobURL;

        masterVideoCanvas = new VideoCanvas(masterVideo);
    }

    $('#switch').click(function () {
        $('#leftVideo').toggle();
        $('#leftPlot').toggle();
        $('#rightVideo').toggle();
        $('#rightPlot').toggle();
        $('#animationSliderDiv').toggle();
        //adjustPlotSize();

        visualizeFeedback(masterBlob, getRecordedUserBlob(), recordedSequence);
    });

    let uv = document.getElementById("userVideo");
    uv.oncanplay = function() {
        console.log("[main.js] Registering user video canvas")
        userVideoCanvas = new VideoCanvas(uv, "user", getCurrentUserPose);
    }
    let mv = document.getElementById("masterVideo");
    mv.oncanplay = function() {
        console.log("[main.js] Registering master video canvas")
        masterVideoCanvas = new VideoCanvas(mv, "master", getCurrentMasterPose);
    }

    $("#video_form").submit(function(e) {
        console.log("[main.js] Uploading master video")
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

                if(masterVideoCanvas) {
                    console.log("[main.js] Drawing master poses")
                    masterVideoCanvas.startDrawing();
                }
            },
            error: function(msg) {
                console.log('[main.js] ajax video upload failure');

                $("#loader").css("display", "none");
                $("#loading_overlay").css("display", "none");
                alert("Video upload failed")
            }
        });
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

    // Show file name after selection
    $(".custom-file-input").on("change", function() {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });

    // Video capturing start/stop buttons
    console.log("[main.js] Registering callbacks");
    $('#record').on("click", function() {
        startWebRTC();
        setTimeout(function() {
            masterVideoCanvas.startVideo();
            userVideoCanvas.startVideo();
            userVideoCanvas.startDrawing();
            startRecording();
        }, 2000);
    });
    $('#recordStop').on("click", function() {
        stopRecording();
        stopWebRTC();
        userVideoCanvas.stopDrawing();
    });

    // Switch between master & use video in feedback view
    let radio = document.getElementById("masterRadioButton");
    radio.onclick = function(_) {
        showMaster = true;
        updateFeedbackVideoSource();
        updateData();
    }

    // Switch between master & use video in feedback view
    let radio2 = document.getElementById("userRadioButton");
    radio2.onclick = function(_) {
        showMaster = false;
        updateFeedbackVideoSource();
        updateData();
    }


});