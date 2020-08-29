function draw2dPose(ctx, pose){
    //console.log("[2d_plot.js] Pose:", pose)


    for (let i = 0; i < connections.length; i++) {
        const c = connections[i];

        var p1 = pose[c["start"]];
        var p2 = pose[c["end"]];

        p1 = [p1[0] * ctx.canvas.width, p1[1] * ctx.canvas.height];
        p2 = [p2[0] * ctx.canvas.width, p2[1] * ctx.canvas.height];

        //TODO: make into two paths, one black, one red
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = c.color;
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke()
    }



    ctx.beginPath();
    pose.forEach((p) => {
        ctx.moveTo(p[0], p[1]);
        ctx.arc(
            p[0] * ctx.canvas.width,
            p[1] * ctx.canvas.height,
            8, 0, 2*Math.PI
        );
    })
    ctx.fill();
}

function drawLine(ctx, x0, y0, x1, y1, c='black'){
    //var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineWidth = 5;
    ctx.strokeStyle = c;
    ctx.stroke();
}

function drawPoint(ctx, x0, y0, r, c='black'){
    //var ctx = canvas.getContext('2d');
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
function drawLineWithArrows(ctx, x0,y0,x1,y1,aWidth,aLength,arrowStart,arrowEnd){
    //ctx = canvas.getContext('2d');
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
