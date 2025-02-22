var masterBlobURL = null;

$(document).ready(function() {
    // preview of uploaded video
    document.querySelector("input[type=file]").onchange = function(event) {
        document.getElementById('media').style.display = 'grid';

        var masterVideo = document.getElementById("masterVideo");
        masterVideo.onended = function(e) {
            console.log("[main.js] Master video finished...stop recording");
            $("#recordStop").hide();
            RecordingManager.stopRecording();
            masterVideoCanvas.stopVideo();
            userVideoCanvas.stopVideo();

            $("#loader").css("display", "block");
            $("#loading_overlay").css("display", "block");
            stopWebcam();
        };

        let file = event.target.files[0];
        let blobURL = URL.createObjectURL(file);
        masterBlobURL = blobURL;
        masterVideo.src = blobURL;

        masterVideoCanvas = new VideoCanvas(masterVideo, "master", PoseManager.getCurrentMasterPos);
    }

    $(document).keypress(function(e) {
        if(e.originalEvent.key === "1") {
            $('#leftVideo').toggle();
            $('#leftPlot').toggle();
            $('#rightVideo').toggle();
            $('#rightPlot').toggle();
            $('#animationSliderDiv').toggle();
        }
        console.log(e)
    })

    $('#switch').click(function () {
        switchViews();
    });

    let uv = document.getElementById("userVideo");
    console.log("[main.js] Registering user video canvas");
    userVideoCanvas = new VideoCanvas(uv, "user", PoseManager.getCurrentUserPose);

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

        $("#fileDiv").hide();
        $("#loader").css("display", "block");
        $("#loading_overlay").css("display", "block");
        var form = $("#video_form")[0];
        var formData = new FormData(form);
        formData.append("video_name", fileName);
        $.ajax({
            type: "POST",
            url: "/master_video",
            processData: false,
            contentType: false,
            data: formData,
            beforeSend: function(){
                console.log("[main.js] Uploading master video with data:", formData);
            },
            success: function(msg) {
                console.log("[main.js]: Master Video response: ", msg);
                RecordingManager.setMasterId(msg["id"]);

                //updateMasterPoseList(master_results);

                $("#loader").css("display", "none");
                $("#loading_overlay").css("display", "none");

                if(masterVideoCanvas) {
                    //console.log("[main.js] Drawing master poses")
                    //masterVideoCanvas.startDrawing();
                }
            },
            error: function(msg) {
                console.log('[main.js] ajax video upload failure');

                $("#loader").css("display", "none");
                $("#loading_overlay").css("display", "none");
                alert("Video upload failed")
            }
        });

        $("#record").show();
    });

    // Video capturing start/stop buttons
    console.log("[main.js] Registering callbacks");
    $('#record').on("click", function() {
        startWebcam();
        $("#record").hide();
        $("#recordingInterface").hide();
        $("#uiContainer").hide();
        //startWebRTC();
        $("#countdown").css("display", "block");
        //var counter = 5;
        var counter = 3;
        $("#loader").css("display", "block");
        $("#countdown_value").text(counter);

        var interval = setInterval(function(){
            counter--;
            $("#countdown_value").text(counter);
            console.log("[main.js] Recording starting in: " + counter + "s");
            if(counter <=0){ finishCounter();}
        }, 1000);

        var finishCounter = function(){
            masterVideoCanvas.startVideo();
            //userVideoCanvas.startVideo();
            RecordingManager.startRecording();
            clearInterval(interval);
            $("#countdown").css("display", "none");
            interval = null;
            $("#loader").css("display", "none");
            //$("#recordStop").show();
        };
    });
    $('#recordStop').on("click", function() {
        $("#recordStop").hide();
        RecordingManager.stopRecording();
        stopWebcam();
        //stopWebRTC();
        masterVideoCanvas.stopVideo();
        userVideoCanvas.stopVideo();

        $("#loader").css("display", "block");
        $("#loading_overlay").css("display", "block");
        //masterVideoCanvas.stopDrawing();
        //userVideoCanvas.stopDrawing();
    });

    let slider = document.getElementById("animationSlider");
    let feedbackVideo = document.getElementById("feedbackVideo");
    slider.value = 0;
    slider.oninput = function() {
        FeedbackManager.updateData();
        FeedbackManager.updateFeedbackVideo();
    }
    slider.onchange = function() {
        FeedbackManager.update3DPlot();
    }

    // Switch between master & use video in feedback view
    let radio = document.getElementById("masterRadioButton");
    radio.onclick = function(_) {
        console.log("[main.js] Showing master video in feedback screen")
        FeedbackManager.showMaster();
        FeedbackManager.updateFeedbackVideoSource();
        FeedbackManager.updateData();
        FeedbackManager.updateFeedbackVideo();
    }

    // Switch between master & use video in feedback view
    let radio2 = document.getElementById("userRadioButton");
    radio2.onclick = function(_) {
        console.log("[main.js] Showing user video in feedback screen")
        FeedbackManager.showUser();
        FeedbackManager.updateFeedbackVideoSource();
        FeedbackManager.updateData();
        FeedbackManager.updateFeedbackVideo();
    }

    startWebcam();

    function startWebcam() {
        var video = document.querySelector("#userVideo");

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                    video.srcObject = stream;
                })
                .catch(function (err0r) {
                    console.log("Something went wrong!");
                });
        }
    }

    function stopWebcam() {
        var video = $("#userVideo")[0];
        if(video.srcObject){
            stream = video.srcObject;
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
    }
});

function switchViews(){
    $('#leftVideo').toggle();
    $('#leftPlot').toggle();
    $('#rightVideo').toggle();
    $('#rightPlot').toggle();
    $('#animationSliderDiv').toggle();
    $("#switch").hide();
    $("#uiContainer").toggle();
    //adjustPlotSize();

    FeedbackManager.visualizeFeedback(masterBlobURL, RecordingManager.getRecordedUserBlobURL());
}