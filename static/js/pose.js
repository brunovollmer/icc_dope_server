var _masterPoseList = null;
var _userPoseList = null;
var _comparisonScores = null;

var _userPose = null;
var _masterPose = null;

function getUserPoseList(){
    return _userPoseList;
}

function getMasterPoseList(){
    return _masterPoseList;
}

function updateComparisonScores(scores) {
    _comparisonScores = scores;
    console.log("[pose.js] Comparison scores list updated", _comparisonScores);
}

function hasMasterPoseList() {
    return _masterPoseList && _masterPoseList.length > 0;
}

function hasUserPoseList() {
    return _userPoseList && _userPoseList.length > 0;
}

function updateMasterPoseList(poseList) {
    if(poseList && poseList.length > 0) {
        _masterPoseList = poseList;
        _masterPose = _masterPoseList[0];
        console.log("[pose.js] Master pose list updated", _masterPoseList);
        return true;
    } else {
        console.log("[pose.js] Master pose list is null/empty");
        return false;
    }
}

function updateUserPoseList(poseList) {
    if(poseList && poseList.length > 0) {
        _userPoseList = poseList;
        _userPose = _userPoseList[0];
        console.log("[pose.js] User pose list updated", _userPoseList);
        return true;
    } else {
        console.log("[pose.js] User pose list is null/empty");
        return false;
    }
}

function updateUserPose(newPose) {
    _userPose = newPose;
}

function getCurrentUserPose(video) {
    return _userPose;
}

function getCurrentMasterPose(video) {
    if(_masterPoseList === null || _masterPoseList.length === 0){
        return null;
    }

    if(!video) {
        console.log("[pose.js] Master video is undefined");
        return null;
    }

    var fraction = video.currentTime / video.duration;
    var index = Math.round(fraction * _masterPoseList.length);
    if(index >= _masterPoseList.length) index = _masterPoseList.length - 1;
    _masterPose = _masterPoseList[index];

    return _masterPose[0];
}

// getCurrentFeedbackPose = function (video) {
//     return null;
// }
