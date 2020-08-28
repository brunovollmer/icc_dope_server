var _masterPoseList = null;

var _userPose = null;
var _masterPose = null;

function hasMasterPoseList() {
    return _masterPoseList && _masterPoseList.length > 0;
}

function updateMasterPoseList(poseList) {
    if(poseList && poseList.length > 0) {
        _masterPoseList = poseList;
        _masterPose = _masterPoseList[0];
        return true;
    } else {
        console.log("[pose.js] Master pose list is null/empty");
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

    fraction = video.currentTime / video.duration;
    _masterPose = _masterPoseList[Math.round(fraction * _masterPoseList.length)]

    return _masterPose[0];
}

// getCurrentFeedbackPose = function (video) {
//     return null;
// }
