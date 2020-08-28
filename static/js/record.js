var mediaRecorder = null;
var poseSnapshotSequence = null;

function startRecording() {
    if(!hasMasterPoseList()) {
        console.log("[record.js] No master pose list, upload video first!");
        return;
    }

    var videoSource = document.getElementById('userVideo');
    console.log("[record.js] videoSource:", videoSource);
    var video = document.getElementById('userPlotVideo');

    var chunks = [];

    console.log("[record.js] Recorder: Init recorder");
    var videoStream = videoSource.mozCaptureStream ? videoSource.mozCaptureStream() : videoSource.captureStream();
    mediaRecorder = new MediaRecorder(videoStream);
    poseSnapshotSequence = new PoseSnapshotSequence(
        masterVideoCanvas._video,
        userVideoCanvas._video
    );

    mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
    };

    mediaRecorder.onstop = function(e) {
        console.log("[record.js] Recorder: Finalizing recording");
        var blob = new Blob(chunks, { 'type' : 'video/mp4' });
        chunks = [];
        var videoURL = URL.createObjectURL(blob);
        video.src = videoURL;
        console.log("[record.js] Recorder: Video ready");
    };

    console.log("[record.js] Recorder: Start recording");
    mediaRecorder.start();
    poseSnapshotSequence.startCapture();

    $('#record').toggle();
    $('#recordStop').toggle();
}

function stopRecording() {
    console.log("[record.js] Recorder: Stop recording");
    // TODO: ????
    //Add timeout to not lose data
    setTimeout(function (){
        mediaRecorder.stop();
        poseSnapshotSequence.stopCapture();
    }, 2000);

    $('#recordStop').toggle();
    $('#record').toggle();
}

$(document).ready(function() {
    console.log("[record.js] Registering callbacks");
    $('#record').on("click", startRecording);

    $('#recordStop').on("click", stopRecording);
});