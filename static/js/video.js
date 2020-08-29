var userVideoCanvas = null;
var masterVideoCanvas = null;
var feedbackVideoCanvas = null;

function getMasterTimestamp() {
    if(!masterVideoCanvas) return 0;
    return masterVideoCanvas._video.currentTime;
}

function getUserTimestamp() {
    if(!userVideoCanvas) return 0;
    return userVideoCanvas._video.currentTime;
}

function getUserVideo() {
    if(!userVideoCanvas) {
        console.log("[video.js] No user video set!");
        return null;
    }
    return userVideoCanvas._video;
}

function getMasterVideo() {
    if(!masterVideoCanvas) {
        console.log("[video.js] No master video set!");
        return null;
    }
    return masterVideoCanvas._video;
}

function getFeedbackVideo() {
    if(!feedbackVideoCanvas) {
        console.log("[video.js] No feedback video set!");
        return null;
    }
    return feedbackVideoCanvas._video;
}

class VideoCanvas {
    constructor(video, baseId, poseCallback) {
        console.log("[video.js] Initializes VideoCanvas: " + baseId);
        this._baseId = baseId;
        var canvas = document.getElementById(baseId + "_canvas");
        if(canvas) {
            this._canvas = canvas;
        } else {
            this._canvas = document.createElement("CANVAS");
            this._canvas.id = baseId + "_canvas";
            video.parentElement.append(this._canvas);
        }

        this._canvas.style.pointerEvents = "none";
        this._context = this._canvas.getContext("2d");

        this._video = video;
        this._videoInterval = null;

        this._poseCallback = poseCallback;

        this.resizeCanvas();
    }

    startVideo() {
        this._video.play();
        //this.startDrawing();
    }

    stopVideo() {
        this._video.pause();
        //this.stopDrawing();
    }

    setVideoCurrentTime(timestamp) {
        this._video.currentTime = timestamp;
    }

    startDrawing() {
        if(!this._videoInterval) {
            var _self = this;
            this._videoInterval = setInterval(function() {
                _self.resizeCanvas();

                var currentPose = _self._poseCallback(_self._video);
                if(currentPose && currentPose.body.length > 0) {
                    _self.clearCanvas();
                    _self.drawPose2D(currentPose["body"][0]?.pose2d);
                }
            }, 1000/30);
        }
    }

    stopDrawing() {
        if(this._videoInterval) {
            clearInterval(this._videoInterval);
            this._videoInterval = null;
        }
    }

    resizeCanvas() {
        var ratio = this._video.videoHeight / this._video.videoWidth;
        if(this._video.videoHeight < this._video.videoWidth){
            this._context.canvas.width = this._video.clientWidth;
            this._context.canvas.height = this._video.clientWidth*ratio;
        } else {
            ratio = this._video.videoWidth / this._video.videoHeight;
            this._context.canvas.width = this._video.clientHeight/ratio;
            this._context.canvas.height = this._video.clientHeight;
        }
    }

    drawPose2D(pose) {
        if(pose) {
            this.resizeCanvas();
            draw2dPose(this._canvas, pose);
        }
    }

    drawArrowBetweenPoses(fromPose, toPose) {
        console.log("[video.js] Draw arrow from ", fromPose, "to", toPose);
        for(let j = 0; j < num_points; j++) {
            let p0 = fromPose[j];
            let x0 = p0[0];
            let y0 = p0[1];
            let p1 = toPose[j];
            let x1 = p1[0];
            let y1 = p1[1];
            drawLineWithArrows(this._canvas, x0, y0, x1, y1, 5, 5, false, true);
        }
    }

    clearCanvas() {
        this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
    }
}
