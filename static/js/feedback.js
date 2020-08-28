var showMaster = document.getElementById('masterRadioButton').checked;
var poseSequence;
var timeStep = 0;
var video = document.getElementById('feedbackVideo');
var slider;

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

    feedbackVideoCanvas.clearCanvas();

    if (showMaster){
        feedbackVideoCanvas.setVideoCurrentTime(poseSequence[timeStep]['masterTimestamp']);
        render3DPose(poseSequence[timeStep]['masterPose']['body'][0]['pose3d']);
        feedbackVideoCanvas.drawPose2D(poseSequence[timeStep]['masterPose']['body'][0]['pose2d']);
    }else{
        feedbackVideoCanvas.setVideoCurrentTime(poseSequence[timeStep]['userTimestamp']);
        render3DPose(poseSequence[timeStep]['userPose']['body'][0]['pose3d']);
        feedbackVideoCanvas.drawPose2D(poseSequence[timeStep]['userPose']['body'][0]['pose2d']);
    }


}

function visualizeFeedback(blobMaster, blobUser, data) {
    //data = [{'masterTimestamp': 0, 'masterPose': {'body': {'pose3d': test_poses_3d[0], 'pose2d': test_poses_2d[0]}}}, {'masterTimestamp': 1, 'masterPose': {'body': {'pose3d': test_poses_3d[1], 'pose2d': test_poses_2d[1]}}}]

    poseSequence = data;

    if (showMaster){
        video.src = blobMaster;
    } else {
        video.src = blobUser;
    }

    slider = $("#slider").slider({
        min: 0,
        max: data.length - 1,
        value: 0
    }).on('slide', function(event){
        updateData();
    }).on('change', function(event){
        updateData();
    }).data('slider');

    feedbackVideoCanvas = new VideoCanvas(video, "feedback", getCurrentFeedbackPose);

    create_3d_plot('container');

    if (showMaster){
        render3DPose(poseSequence[timeStep]['masterPose']['body'][0]['pose3d']);
        feedbackVideoCanvas.drawPose2D(poseSequence[timeStep]['masterPose']['body'][0]['pose2d']);
    }else{
        render3DPose(poseSequence[timeStep]['userPose']['body'][0]['pose3d']);
        feedbackVideoCanvas.drawPose2D(poseSequence[timeStep]['userPose']['body'][0]['pose2d']);
    }
}
