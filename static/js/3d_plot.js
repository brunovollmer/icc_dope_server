var _chart;
var _shiftPoses = 0.8;

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
            gridLineWidth: 1,
            reversed: true
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

function shift3DPoint(point, index, value) {
    var shiftedPoint = [0,0,0];

    for(i=0; i<3; i++){
        if(i===index){
            shiftedPoint[i] = point[i] + value;
        } else {
            shiftedPoint[i] = point[i];
        }
    }

    return shiftedPoint;
}

var render3DPose = function (master, user) {

    while (_chart.series.length > 0) {
        _chart.series[0].remove(true);
    }

    if(master){
        for (let i = 0; i < connections.length; i++) {
            const c = connections[i];

            if(!master[c['start']] || !master[c['end']]){
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
                    lineColor: "black",
                    data: [shift3DPoint(master[c['start']],0,_shiftPoses), shift3DPoint(master[c['end']],0,_shiftPoses)]
                };
                _chart.addSeries(c_series, false);
            }
        }

        _chart.redraw();
    }

    if(user){
        for (let i = 0; i < connections.length; i++) {
            const c = connections[i];

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
                    data: [shift3DPoint(user[c['start']],0,-_shiftPoses), shift3DPoint(user[c['end']],0,-_shiftPoses)]
                };
                _chart.addSeries(c_series_user, false);
            }
        }

        _chart.redraw();
    }
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
