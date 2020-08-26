const num_points = 15;

var masterVideo = null;
var masterPoseList = null;

var userPose = null;
var masterPose = null;

var log = document.getElementById("pose-log")

loadMasterPoseList = function(poseList) {
    masterPoseList = poseList
    log.textContent += "Master video loaded, " + masterPoseList.length + "frames"
}

updateUserPose = function(newPose) {
    userPose = newPose;
    log.textContent += "\nNew pose:\n"
    log.textContent += JSON.stringify(newPose)

}

updateMasterPose = function(masterVideo) {
    if(masterPoseList === null || masterPoseList.length == 0) return;
    fraction = masterVideo.currentTime / masterVideo.duration;
    masterPose = masterPoseList[Math.round(fraction)]
}