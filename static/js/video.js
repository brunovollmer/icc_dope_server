var userVideoCanvas;
var masterVideoCanvas;
var feedbackVideoCanvas;

class VideoCanvas {
    constructor(video, baseId, poseCallback) {
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
    }

    startVideo() {
        this._video.play();
        this.startDrawing();
    }

    stopVideo() {
        this._video.stop();
        this.stopDrawing();
    }

    setVideoCurrentTime(timestamp) {
        this._video.currentTime = timestamp;
    }

    startDrawing() {
        if(!this._videoInterval) {
            var _self = this;
            this._videoInterval = setInterval(function() {
                var ratio = _self._video.videoHeight / _self._video.videoWidth;
                if(_self._video.videoHeight < _self._video.videoWidth){
                    _self._context.canvas.width = _self._video.clientWidth;
                    _self._context.canvas.height = _self._video.clientWidth*ratio;
                } else {
                    ratio = _self._video.videoWidth / _self._video.videoHeight;
                    _self._context.canvas.width = _self._video.clientHeight/ratio;
                    _self._context.canvas.height = _self._video.clientHeight;
                }

                var currentPose = _self._poseCallback(_self._video);
                if(currentPose) {
                    _self.drawPose2D(currentPose["body"][0]["pose2d"]);
                } else {
                    _self._context.clearRect(0, 0, _self._canvas.width, _self._canvas.height);
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

    drawPose2D(pose) {
        if(pose) {
            draw2dPose(this._canvas, pose);
        }
    }

    clearCanvas() {
        this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
    }
}
