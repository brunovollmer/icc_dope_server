const num_points = 15;

var masterVideo = null;
var masterPoseList = null;

var userPose = null;
var masterPose = null;

updateUserPose = function(newPose) {
    userPose = newPose;
    log = document.getElementById("pose-log")
    log.textContent += "\nNew pose:\n"
    log.textContent += JSON.stringify(newPose)

}

updateMasterPose = function(masterVideo) {
    if(masterPoseList === null || masterPoseList.length == 0) return;
    fraction = masterVideo.currentTime / masterVideo.duration;
    masterPose = masterPoseList[Math.round(fraction)]
}