var userVideoCanvas;
var masterVideoCanvas;
var feedbackVideoCanvas;

class VideoCanvas {
    constructor(video, baseId) {
        canvas = document.getElementById(baseId + "_canvas");
        if(canvas) {
            this._canvas = canvas;
        } else {
            this._canvas = document.createElement("CANVAS");
            this._canvas.id = baseId + "_canvas";
        }

        video.parentElement.append(this._canvas);
        this._context = this._canvas.getContext("2d");
        console.log(this._canvas)
        console.log(this._context)
        this._video = video;
        this._videoInterval = null;
    }

    startVideo() {
        this._video.play();
        if(!this._videoInterval) {
            var _self = this;
            this._videoInterval = setInterval(function() {
                _self._context.canvas.width = _self._video.clientWidth;
                _self._context.canvas.height = _self._video.clientHeight;

                _self.drawPose2D(null);
            }, 1000/30);
        }
    }

    stopVideo() {
        this._video.stop();
        if(this._videoInterval) {
            clearInterval(this._videoInterval);
            this._videoInterval = null;
        }
    }

    drawPose2D(pose) {
        drawPoint(this._canvas, 10, 10, 10);
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
