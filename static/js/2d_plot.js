var video;
var context;
var canvas;

function drawVideoOnCanvas(canvasElem, videoSrc, videoId) {
    // var width = canvas.width();
    // console.log(width);

    canvas = canvasElem;

    leftDiv = $('#leftDiv');
    canvas.width = leftDiv.width();
    // canvas.height = leftDiv.height();


    context = canvas.getContext("2d");

    video = document.createElement("video");
    video.src = videoSrc;
    video.id = videoId

    video.addEventListener('loadeddata', function() {
        console.log("loadeddata");
        setTimeout(videoLoop, 1000 / 30);
    });

    context.drawImage(video, 0, 0);
}


function videoLoop() {
    console.log(video);
    if (video && !video.paused && !video.ended) {
        var vRatio = (canvas.height / video.videoHeight) * video.videoWidth;

        console.log(vRatio);
        context.drawImage(video, 0, 0, vRatio, canvas.height);
        drawLineWithArrows(canvas,0,0,50,50,2,5,false,true);

    }

    console.log("hallo")
    setTimeout(videoLoop, 1000 / 30);
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
    canvas.width = leftDiv.width();
    canvas.height = leftDiv.height();
}

$(window).on('resize', function(){
    adjustCanvasSize();
});
