let FeedbackManager = (function() {
    var _showMaster = document.getElementById('masterRadioButton').checked;
    var _timeStep = 0;
    var _feedbackVideo = document.getElementById('feedbackVideo');
    var _slider = document.getElementById("animationSlider");
    var _userBlobURL = "";
    var _masterBlobURL = "";
    var _masterPoses;
    var _userPoses;
    var _scores;

    function showMaster() { _showMaster = true; }

    function showUser() { _showMaster = false; }

    function updateFeedbackVideoSource() {
        if (_showMaster){
            console.log("[feedback.js] Setting feedback video source to master")
            _feedbackVideo.src = _masterBlobURL;
        } else {
            console.log("[feedback.js] Setting feedback video source to user")
            _feedbackVideo.src = _userBlobURL;
        }
    }

    function updateFeedbackVideo() {
        _feedbackVideo.currentTime = (_timeStep / 30);
    }

    function getCurrentFeedbackPose() {
        if (_showMaster){
            return _masterPoses[_timeStep];
        }else{
            return _userPoses[_timeStep];
        }
    }

    function updateData() {
        _timeStep = _slider.value;
        $("#animationTimestep").text(_timeStep);
    }

    function update3DPlot() {
        render3DPose(_masterPoses[_timeStep]['body'][0]?.pose3d, _userPoses[_timeStep]['body'][0]?.pose3d, _scores[_timeStep]);
    }

    function visualizeFeedback(blobMaster, blobUser) {
        _userBlobURL = blobUser;
        _masterBlobURL = blobMaster;
        updateFeedbackVideoSource();

        _masterPoses = PoseManager.getMasterPoseList();
        _userPoses = PoseManager.getUserPoseList();
        _scores = PoseManager.getComparisonScores();

        //data = [{'masterTimestamp': 0, 'masterPose': {'body': {'pose3d': test_poses_3d[0], 'pose2d': test_poses_2d[0]}}}, {'masterTimestamp': 1, 'masterPose': {'body': {'pose3d': test_poses_3d[1], 'pose2d': test_poses_2d[1]}}}]
        if(!_masterPoses || _masterPoses.length === 0) {
            console.log("[feedback.js] Can't visualize feedback, no master pose sequence given!");
            return;
        }

        if(!_userPoses || _userPoses.length === 0) {
            console.log("[feedback.js] Can't visualize feedback, no user pose sequence given!");
            return;
        }

        _slider.max = Math.max(_masterPoses.length, _userPoses.length) - 1;
        _slider.focus()
        console.log("[feedback.js] Change slider.max to " + _slider.max);

        feedbackVideoCanvas = new VideoCanvas(_feedbackVideo, "feedback", getCurrentFeedbackPose);
        feedbackVideoCanvas.startDrawing();

        create_3d_plot('container');

        render3DPose(_masterPoses[_timeStep]['body'][0]?.pose3d, _userPoses[_timeStep]['body'][0]?.pose3d, _scores[_timeStep]);
    }

    return {
        showMaster: showMaster,
        showUser: showUser,
        updateFeedbackVideoSource: updateFeedbackVideoSource,
        updateFeedbackVideo: updateFeedbackVideo,
        getCurrentFeedbackPose: getCurrentFeedbackPose,
        updateData: updateData,
        update3DPlot: update3DPlot,
        visualizeFeedback: visualizeFeedback
    }
})();
