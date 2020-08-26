var video;
var context;
var canvas;

function playVideo() {
    video.play();
}

function drawVideoOnCanvas(canvasElem, videoSrc, videoId) {
    // var width = canvas.width();
    // console.log(width);

    canvas = canvasElem;

    leftDiv = $('#leftDiv');
    canvas.width = leftDiv.width();
    canvas.height = leftDiv.height();


    context = canvas.getContext("2d");

    video = document.createElement("video");
    video.src = videoSrc;
    video.id = videoId

    video.addEventListener('loadeddata', function() {
        console.log("loadeddata");
        //video.play();
        setTimeout(videoLoop, 1000 / 30);

    });

    context.drawImage(video, 0, 0);
}


function videoLoop() {
    if (video && !video.paused && !video.ended) {
        context.canvas.width = video.videoWidth;
        context.canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        draw2dPose(canvas, getCurrentMasterPose()["body"][0]["pose2d"])
        // drawLineWithArrows(canvas,0,0,50,50,2,5,false,true);
    }
    setTimeout(videoLoop, 1000 / 30);
}

function draw2dPose(canvas, pose){
    console.log("Pose:", pose)

    for (let i = 0; i < connections.length; i++) {
        const c = connections[i];

        var p1 = pose[c["start"]];
        var p2 = pose[c["end"]];

        p1 = [p1[0] * canvas.width, p1[1] * canvas.height];
        p2 = [p2[0] * canvas.width, p2[1] * canvas.height];
        drawLine(canvas, p1[0], p1[1], p2[0], p2[1], c.color);
        drawPoint(canvas, p1[0], p1[1], 5);
        drawPoint(canvas, p2[0], p2[1], 5);
    }
}


function drawLine(canvas, x0, y0, x1, y1, c='black'){
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineWidth = 5;
    ctx.strokeStyle = c;
    ctx.stroke();
}

function drawPoint(canvas, x0, y0, r, c='black'){
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x0, y0, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = c;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = c;
    ctx.stroke();
}

// // x0,y0: the line's starting point
// // x1,y1: the line's ending point
// // width: the distance the arrowhead perpendicularly extends away from the line
// // height: the distance the arrowhead extends backward from the endpoint
// // arrowStart: true/false directing to draw arrowhead at the line's starting point
// // arrowEnd: true/false directing to draw arrowhead at the line's ending point
function drawLineWithArrows(canvas, x0,y0,x1,y1,aWidth,aLength,arrowStart,arrowEnd){
    ctx = canvas.getContext('2d');
    var dx=x1-x0;
    var dy=y1-y0;
    var angle=Math.atan2(dy,dx);
    var length=Math.sqrt(dx*dx+dy*dy);
    //
    ctx.translate(x0,y0);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(length,0);
    if(arrowStart){
        ctx.moveTo(aLength,-aWidth);
        ctx.lineTo(0,0);
        ctx.lineTo(aLength,aWidth);
    }
    if(arrowEnd){
        ctx.moveTo(length-aLength,-aWidth);
        ctx.lineTo(length,0);
        ctx.lineTo(length-aLength,aWidth);
    }
    //
    ctx.stroke();
    ctx.setTransform(1,0,0,1,0,0);
}

function adjustCanvasSize() {
    leftDiv = $("#leftDiv");
    canvas.width = leftDiv.width();
    canvas.height = leftDiv.height();
    drawLineWithArrows(canvas,100,100,20,20,2,5,false,true);
}

$(window).on('resize', function(){
    //adjustCanvasSize();
});
