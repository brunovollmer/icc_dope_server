var userVideoCanvas;
var masterVideoCanvas;
var feedbackVideoCanvas;

class VideoCanvas {
    constructor(video, baseId, poseCallback) {
        canvas = document.getElementById(baseId + "_canvas");
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

    startDrawing() {
        if(!this._videoInterval) {
            var _self = this;
            this._videoInterval = setInterval(function() {
                _self._context.canvas.width = _self._video.clientWidth;
                _self._context.canvas.height = _self._video.clientHeight;

                var currentPose = _self._poseCallback(_self._video);
                _self.drawPose2D(currentPose["body"][0]["pose2d"]);
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
            for (let i = 0; i < connections.length; i++) {
                const c = connections[i];

                var p1 = pose[c["start"]];
                var p2 = pose[c["end"]];

                p1 = [p1[0] * this._canvas.width, p1[1] * this._canvas.height];
                p2 = [p2[0] * this._canvas.width, p2[1] * this._canvas.height];
                drawLine(this._canvas, p1[0], p1[1], p2[0], p2[1], c.color);
                drawPoint(this._canvas, p1[0], p1[1], 5);
                drawPoint(this._canvas, p2[0], p2[1], 5);
            }
        }
    }
}
