class Log {
    constructor() {
        this._toggleButton = document.getElementById("logging-toggle");
        this._toggleAutoscrollButton = document.getElementById("toggle-autoscroll");
        this._loggingContainer = document.getElementById("logging-container");

        this._messageLog = document.getElementById("data-channel");
        this._poseLog = document.getElementById("poseLog");
        this._poseDisplay = document.getElementById("poseDisplay");

        this._autoScrollInterval = null;

        var _self = this;
        this._toggleButton.onclick = function(_) {
            _self.toggle();
        };
        this._toggleAutoscrollButton.onclick = function(_) {
            if(_self._autoScrollInterval) {
                clearInterval(_self._autoScrollInterval);
                _self._autoScrollInterval = null;
            } else {
                _self._autoScrollInterval = setInterval(function () {
                    _self._messageLog.scrollTop = _self._messageLog.scrollHeight;
                }, 200);
            }
        }
    }

    logMessage(message) {
        this._messageLog.textContent += message + "\n";
    }

    logMasterPoseList(masterPoseList) {

    }

    logUserPose(pose) {

    }

    logPose(pose) {
        if(!pose) return;
        if(pose.body.length === 0) {
            this._poseDisplay.textContent = "No bodies found";
        } else {
            var pose2d = pose.body[0].pose2d;
            var pose3d = pose.body[0].pose3d;
            this._poseDisplay.textContent = "Pose 2D: " + JSON.stringify(pose2d) + "\n";
            this._poseDisplay.textContent += "Pose 3D: " + JSON.stringify(pose3d);
        }
        this._poseLog.textContent += JSON.stringify(pose);
    }

    show() {
        this._loggingContainer.style.display = "block";
    }

    hide() {
        this._loggingContainer.style.display = "none";
    }

    toggle() {
        if(this._loggingContainer.style.display === "none") {
            this.show();
        } else {
            this.hide();
        }
    }
}

var log = new Log();
