var _mediaRecorder = null;
var _recordedUserBlob = null;

function getRecordedUserBlob() {
    if(!_recordedUserBlob) return "";
    return URL.createObjectURL(_recordedUserBlob);
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
        _recordedUserBlob = blob;
        chunks = [];
        //var videoURL = URL.createObjectURL(blob);
        //var video = document.getElementById('feedbackVideo');
        //video.src = videoURL;
        console.log("[record.js] Recorder: Video ready");
    };

    console.log("[record.js] Recorder: Start recording");
    _mediaRecorder.start();
    startPoseCapture();
}

function stopRecording() {
    console.log("[record.js] Recorder: Stop recording");
    if(_mediaRecorder) {
        _mediaRecorder.stop();
    }
    stopPoseCatpure();
}
