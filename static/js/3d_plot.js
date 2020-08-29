var _chart;

function testRendering3D(masterPoseList, userPoseList, scoreList){
    create_3d_plot('container');

    render3DPose(masterPoseList[0]["body"][0]["pose3d"], masterPoseList[1]["body"][0]["pose3d"]);
}

function create_3d_plot(container_id) {

    Highcharts.setOptions({
        colors: Highcharts.getOptions().colors.map(function (color) {
            return {
                radialGradient: {
                    cx: 0.4,
                    cy: 0.3,
                    r: 0.5
                },
                stops: [
                    [0, color],
                    [1, Highcharts.color(color).brighten(-0.2).get('rgb')]
                ]
            };
        })
    });

    // Set up the chart
    _chart = new Highcharts.Chart({
        chart: {
            renderTo: container_id,
            margin: 100,
            type: 'scatter3d',
            animation: false,
            options3d: {
                enabled: true,
                alpha: 10,
                beta: 30,
                depth: 250,
                viewDistance: 5,
                fitToPlot: false,
                frame: {
                    bottom: {
                        size: 1,
                        color: 'rgba(0,0,0,0.02)'
                    },
                    back: {
                        size: 1,
                        color: 'rgba(0,0,0,0.04)'
                    },
                    side: {
                        size: 1,
                        color: 'rgba(0,0,0,0.06)'
                    }
                }
            }
        },
        title: {
            text: 'Movement Coach 3D Pose'
        },
        subtitle: {
            text: 'Click and drag the plot area to rotate in space'
        },
        credits: false,
        exporting: false,
        plotOptions: {
            scatter: {
                width: 40,
                height: 10,
                depth: 10
            }
        },
        yAxis: {
            min: -1.0,
            max: 1.0,
            title: null
        },
        xAxis: {
            min: -2.0,
            max: 2.0,
            gridLineWidth: 1
        },
        zAxis: {
            min: -1.0,
            max: 1.0,
            showFirstLabel: false
        },
        legend: {
            enabled: false
        },
        series: []
    });


    // Add mouse and touch events for rotation
    (function (H) {
        function dragStart(eStart) {
            eStart = _chart.pointer.normalize(eStart);

            var posX = eStart.chartX,
                posY = eStart.chartY,
                alpha = _chart.options.chart.options3d.alpha,
                beta = _chart.options.chart.options3d.beta,
                sensitivity = 5, // lower is more sensitive
                handlers = [];

            function drag(e) {
                // Get e.chartX and e.chartY
                e = _chart.pointer.normalize(e);

                _chart.update({
                    chart: {
                        options3d: {
                            alpha: alpha + (e.chartY - posY) / sensitivity,
                            beta: beta + (posX - e.chartX) / sensitivity
                        }
                    }
                }, undefined, undefined, false);
            }

            function unbindAll() {
                handlers.forEach(function (unbind) {
                    if (unbind) {
                        unbind();
                    }
                });
                handlers.length = 0;
            }

            handlers.push(H.addEvent(document, 'mousemove', drag));
            handlers.push(H.addEvent(document, 'touchmove', drag));


            handlers.push(H.addEvent(document, 'mouseup', unbindAll));
            handlers.push(H.addEvent(document, 'touchend', unbindAll));
        }
        H.addEvent(_chart.container, 'mousedown', dragStart);
        H.addEvent(_chart.container, 'touchstart', dragStart);
    }(Highcharts));

}

function shift3DPose(pose, index, value) {
    var shiftedPose = pose.slice(0);

    for(i=0; i<pose.length; i++){
        shiftedPose[i][index] = pose[i][index] + value;
    }

    return shiftedPose;
}

var render3DPose = function (master, user) {
    //console.log("[3d_plot.js] Rendering master pose", master[0]);
    var localMaster = shift3DPose(master, 0, -1);
    //console.log("[3d_plot.js] Shifted master pose", localMaster[0]);

    while (_chart.series.length > 0) {
        _chart.series[0].remove(true);
    }

    for (let i = 0; i < connections.length; i++) {
        const c = connections[i];

        if(!localMaster[c['start']] || !localMaster[c['end']]){
            console.log("[3d_plot.js] Skipping", i, "as at least one point is undefined", c);
        } else {
            var c_series = {
                name: 'Data',
                colorByPoint: true,
                marker: {
                    symbol: 'circle',
                    enabled: true
                },
                accessibility: {
                    exposeAsGroupOnly: true
                },
                lineWidth: 2,
                lineColor: c['color'],
                data: [localMaster[c['start']], localMaster[c['end']]]
            };

            //console.log("Master at pos", i, [localMaster[c['start']], localMaster[c['end']]]);

            _chart.addSeries(c_series, false);
        }
    }

    _chart.redraw();

    var localUser = shift3DPose(user, 0, 2);
    for (let i = 0; i < connections.length; i++) {
        const c = connections[i];

        //console.log("[3d_plot.js] Rendering", c);

        if(!user[c['start']] || !user[c['end']]){
            console.log("[3d_plot.js] Skipping", i, "as at least one point is undefined", c);
        } else {
            var c_series_user = {
                name: 'Data',
                colorByPoint: true,
                marker: {
                    symbol: 'circle',
                    enabled: true
                },
                accessibility: {
                    exposeAsGroupOnly: true
                },
                lineWidth: 2,
                lineColor: c['color'],
                data: [localUser[c['start']], localUser[c['end']]]
            };
            //console.log("User at pos", i, [localUser[c['start']], localUser[c['end']]]);

            _chart.addSeries(c_series_user, false);
        }
    }

    _chart.redraw();
};

function clear3DPlot() {
    while (_chart.series.length > 0) {
        _chart.series[0].remove(true);
    }
}


function adjustPlotSize() {
    if(_chart){
        _chart.setSize(null, null);
    }
}
