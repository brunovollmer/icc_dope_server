$(document).ready(function() {
    var videoSource = document.getElementById('userVideo');
    var video = document.getElementById('userPlotVideo');

    var chunks = [];

    var mediaRecorder = null;

    $('#record').click(function () {
        console.log("Recorder: Init recorder");
        var videoStream = videoSource.captureStream();
        mediaRecorder = new MediaRecorder(videoStream);

        mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
        };

        mediaRecorder.onstop = function(e) {
            console.log("Recorder: Finalizing recording");
            var blob = new Blob(chunks, { 'type' : 'video/mp4' });
            chunks = [];
            var videoURL = URL.createObjectURL(blob);
            video.src = videoURL;
            console.log("Recorder: Video ready");
        };

        console.log("Recorder: Start recording");
        mediaRecorder.start();
        $('#record').toggle();
        $('#recordStop').toggle();
    });

    $('#recordStop').click(function () {
        console.log("Recorder: Stop recording");
        //Add timeout to not lose data
        setTimeout(function (){ mediaRecorder.stop(); }, 2000);
        $('#recordStop').toggle();
        $('#record').toggle();
    });
});