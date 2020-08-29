var _mediaRecorder = null;
var _recordedUserBlobURL = "";
var _master_id = -1;

function setMasterId(value) {
    console.log("[record.js] Master id is: " + value);
    _master_id = value;
}

function getMasterId(){
    return _master_id;
}

function getRecordedUserBlobURL() {
    return _recordedUserBlobURL;
}

function startRecording() {
    if(!masterVideoCanvas) {
        console.log("[record.js] No master video available");
        return;
    }
    /*if(!hasMasterPoseList()) {
        console.log("[record.js] No master pose list, upload video first!");
        return;
    }*/
    if(!userVideoCanvas) {
        console.log("[record.js] User video stream not available. Start WebRTC first!");
        return;
    }

    console.log("[record.js] Recorder: Init recorder");

    var videoSource = document.getElementById('userVideo');
    var videoStream = videoSource.mozCaptureStream ? videoSource.mozCaptureStream() : videoSource.captureStream();
    _mediaRecorder = new MediaRecorder(videoStream);

    var chunks = [];

    _mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
    };

    _mediaRecorder.onstop = function(e) {
        console.log("[record.js] Recorder: Finalizing recording");
        var blob = new Blob(chunks, { 'type' : 'video/mp4' });
        chunks = [];

        _recordedUserBlobURL = URL.createObjectURL(blob);

        //_master_id = 1;
        if(_master_id === -1){
            console.log("[record.js] Recorder: No master_id. Process aborted!");
            $("#loader").css("display", "none");
            $("#loading_overlay").css("display", "none");
        } else {

            var formData = new FormData();
            formData.append("video_id", _master_id);
            formData.append("video", blob);

            /*var form = $("#user_video_form")[0];
            var formData = new FormData(form);*/

            $.ajax({
                type: "POST",
                url: "/user_video",
                processData: false,
                contentType: false,
                data: formData,
                beforeSend: function(){
                    console.log("[record.js] Uploading user video with id:", _master_id);
                },
                success: function(msg) {
                    data = JSON.parse(msg);
                    console.log("[record.js] User video upload response:", data);
                    updateMasterPoseList(data.master_results);
                    updateUserPoseList(data.user_results);
                    updateComparisonScores(data.scores);
                    $("#loader").css("display", "none");
                    $("#loading_overlay").css("display", "none");
                    //$("#switch").show();
                    switchViews();
                },
                error: function(msg) {
                    console.log('[record.js] ajax user_video upload failure');

                    $("#loader").css("display", "none");
                    $("#loading_overlay").css("display", "none");
                    alert("Video upload failed")
                }
            });
        }

        console.log("[record.js] Recorder: Video ready");
    };

    console.log("[record.js] Recorder: Start recording");
    _mediaRecorder.start();
    //startPoseCapture();
}

function stopRecording() {
        console.log("[record.js] Recorder: Stop recording");
        if(_mediaRecorder) {
            _mediaRecorder.stop();
        }
        //stopPoseCatpure();
}
