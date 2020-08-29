var showMaster = document.getElementById('masterRadioButton').checked;
var poseSequence;
var timeStep = 0;
var _feedbackVideo = document.getElementById('feedbackVideo');
var slider = document.getElementById("animationSlider");
var _userBlobURL = "";
var _masterBlobURL = "";

function updateFeedbackVideoSource() {
    if (showMaster){
        console.log("[feedback.js] Setting feedback video source to master")
        _feedbackVideo.src = _masterBlobURL;
    } else {
        console.log("[feedback.js] Setting feedback video source to user")
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
    timeStep = slider.value;
    $("#animationTimestep").text(timeStep);
    console.log("[feedback.js][v] Set timestep " + timeStep);

    //setFeedbackVideoSource();
    if(!feedbackVideoCanvas) {
        console.log("[feedback.js] Can't update data, feedbackVideoCanvas is null");
        return;
    }

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
    _userBlobURL = blobUser;
    _masterBlobURL = blobMaster;
    updateFeedbackVideoSource();

    //data = [{'masterTimestamp': 0, 'masterPose': {'body': {'pose3d': test_poses_3d[0], 'pose2d': test_poses_2d[0]}}}, {'masterTimestamp': 1, 'masterPose': {'body': {'pose3d': test_poses_3d[1], 'pose2d': test_poses_2d[1]}}}]
    if(!data || data.length === 0) {
        console.log("[feedback.js] Can't visualize feedback, no pose sequence given!");
        return;
    }

    poseSequence = data;

    slider.max = data.length - 1;
    console.log("[feedback.js] Change slider.max to " + slider.max);

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
