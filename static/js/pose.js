var masterPoseList = null;

var userPose = null;
var masterPose = null;

//var log = document.getElementById("pose-log")

function create_point2d(p1, p2) {
    return [(p1[0] + p2[0])/2, (p1[1] + p2[1])/2]
}

function create_point3d(point_1, point_2) {
    tmp_x = (point_1[0] + point_2[0]) / 2
    tmp_y = (point_1[1] + point_2[1]) / 2
    tmp_z = (point_1[2] + point_2[2]) / 2

    return [tmp_x, tmp_y, tmp_z]
}

updateMasterPoseList = function(poseList) {
    masterPoseList = poseList
    masterPoseList.forEach(pose => {
        pose2d = pose[0]["body"][0]["pose2d"];
        pose2d.push(create_point2d(pose2d[HIP_LEFT], pose2d[HIP_RIGHT]));
        pose2d.push(create_point2d(pose2d[SHOULDER_LEFT], pose2d[SHOULDER_RIGHT]));

        pose3d = pose[0]["body"][0]["pose3d"];
        pose3d.push(create_point3d(pose3d[HIP_LEFT], pose3d[HIP_RIGHT]));
        pose3d.push(create_point3d(pose3d[SHOULDER_LEFT], pose3d[SHOULDER_RIGHT]));
    });
    //log.textContent += "Master video loaded, " + masterPoseList.length + "frames"
    console.log(masterPoseList)
    console.log(masterPoseList[0][0]["body"].length)
    masterPose = masterPoseList[0]
    //console.log("updateMasterPoseList:", masterPose)
}

updateUserPose = function(newPose) {
    userPose = newPose;
    /*
    log.textContent = "New user pose:\n";
    if(userPose.body.length > 0) {
        log.textContent += userPose.body.length + " bodies, ";
    } else {
        log.textContent += "no bodies, ";
    }
    if(userPose.face.length > 0) {
        log.textContent += userPose.face.length + " faces, ";
    } else {
        log.textContent += "no faces, ";
    }
    if(userPose.hand.length > 0) {
        log.textContent += userPose.hand.length + " hands\n";
    } else {
        log.textContent += "no hands\n";
    }
    log.textContent += "Body 2d:\n";
    log.textContent += JSON.stringify(userPose.body[0].pose2d)
    */
    //log.textContent += JSON.stringify(newPose);
}

getCurrentUserPose = function (video) {
    console.log(userPose);
    return userPose;
}

getCurrentMasterPose = function (video) {
    if(masterPoseList === null || masterPoseList.length === 0){
        console.log("Empty master pose list")
        return null;
    }

    fraction = video.currentTime / video.duration;
    masterPose = masterPoseList[Math.round(fraction * masterPoseList.length)]

    if(masterPose && masterPose.length > 0){
        return masterPose[0];
    } else {
        return null;
    }
}

// getCurrentFeedbackPose = function (video) {
//     return null;
// }
