var recordedSequence = null;

function startPoseCapture() {

}

function stopPoseCatpure() {

}

class PoseSnapshotSequence {
    constructor(masterVideo, userVideo) {
        this._masterVideo = masterVideo;
        this._userVideo = userVideo;
        this._snapshots = [];
        this._captureInterval = null;
    }

    startCapture() {
        if(!this._captureInterval) {
            var _self = this;
            this._captureInterval = setInterval(function() {
                _self.capture();
            }, 1000/30);
        }
    }

    stopCapture() {
        if(this._captureInterval) {
            clearInterval(this._captureInterval);
            this._captureInterval = null;
        }
        console.log(
            "[pose_recording.js] Recorded sequence of length "
            + this._snapshots.length
            + ", total sequences "
            + recordedSequences.length
        );
    }

    capture() {
        this._snapshots.push({
            currentUserPose: getCurrentUserPose(this._userVideo),
            currentUserTimestamp: this._userVideo.currentTime,
            currentMasterPose: getCurrentMasterPose(this._masterVideo),
            currentMasterTimestamp: this._masterVideo.currentTime
        });
        console.log("[pose_recording.js] " + this._snapshots.length);
    }
}