var showMaster = document.getElementById('masterRadioButton').checked;
var poseSequence;
var timeStep = 0;
var _feedbackVideo = document.getElementById('feedbackVideo');
var slider;
var _userBlobURL = null;
var _masterBlobURL = null;

function updateFeedbackVideoSource() {
    if (showMaster){
        _feedbackVideo.src = _masterBlobURL;
    } else {
        _feedbackVideo.src = _userBlobURL;
    }
}

function getCurrentFeedbackPose() {
    if (showMaster){
        return poseSequence[timeStep]['masterPose'];
    }else{
        return poseSequence[timeStep]['userPose'];
    }
}

function updateData() {
    timeStep = slider.getValue();
    $("#slider_value").text(slider.getValue());

    //setFeedbackVideoSource();

    feedbackVideoCanvas.clearCanvas();

    if (showMaster){
        feedbackVideoCanvas.setVideoCurrentTime(poseSequence[timeStep]['masterTimestamp']);

        if (poseSequence[timeStep].masterPose){
            render3DPose(poseSequence[timeStep]['masterPose']['body'][0]['pose3d']);
        } else {
            clear3DPlot();
        }
    }else{
        feedbackVideoCanvas.setVideoCurrentTime(poseSequence[timeStep]['userTimestamp']);

        if (poseSequence[timeStep].userPose) {
            render3DPose(poseSequence[timeStep]['userPose']['body'][0]['pose3d']);
        } else {
            clear3DPlot();
        }
    }
}

function visualizeFeedback(blobMaster, blobUser, data) {
    //data = [{'masterTimestamp': 0, 'masterPose': {'body': {'pose3d': test_poses_3d[0], 'pose2d': test_poses_2d[0]}}}, {'masterTimestamp': 1, 'masterPose': {'body': {'pose3d': test_poses_3d[1], 'pose2d': test_poses_2d[1]}}}]
    if(!data || data.length === 0) {
        console.log("[feedback.js] No pose sequence given!");
        return;
    }

    poseSequence = data;
    _userBlobURL = blobUser;
    _masterBlobURL = blobMaster;

    updateFeedbackVideoSource();

    slider = $("#slider").slider({
        min: 0,
        max: data.length - 1,
        value: 0,
        natural_arrow_keys: true,
        focus: true
    }).on('slide', function(event){
        updateData();
    }).on('change', function(event){
        updateData();
    }).data('slider');

    feedbackVideoCanvas = new VideoCanvas(_feedbackVideo, "feedback", getCurrentFeedbackPose);
    feedbackVideoCanvas.startDrawing();

    create_3d_plot('container');

    if (showMaster){
        if(poseSequence[timeStep]['masterPose']) {
            render3DPose(poseSequence[timeStep]['masterPose']['body'][0]['pose3d']);
        } else {
            clear3DPlot();
        }
    }else{
        if(poseSequence[timeStep]['userPose']) {
            render3DPose(poseSequence[timeStep]['userPose']['body'][0]['pose3d']);
        } else {
            clear3DPlot();
        }
    }
}
