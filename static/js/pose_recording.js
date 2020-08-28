var recordedSequence = [];
var _captureInterval = null;
var _startTime = 0;

function startPoseCapture() {
    recordedSequence = [];
    _startTime = getUserTimestamp();
    if(!_captureInterval) {
        _captureInterval = setInterval(function() {
            capture();
        }, 1000/30);
    }
}

function stopPoseCatpure() {
    _startTime = 0;
    if(_captureInterval) {
        clearInterval(_captureInterval);
        _captureInterval = null;
    }
    console.log(
        "[pose_recording.js] Recorded sequence of length "
        + recordedSequence.length
    );
}

function capture() {
    recordedSequence.push({
        userPose: getCurrentUserPose(getUserVideo()),
        userTimestamp: getUserTimestamp() - _startTime,
        masterPose: getCurrentMasterPose(getMasterVideo()),
        masterTimestamp: getMasterTimestamp()
    });
}
