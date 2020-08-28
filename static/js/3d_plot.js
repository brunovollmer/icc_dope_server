var chart;

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
    chart = new Highcharts.Chart({
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
            min: -1.0,
            max: 1.0,
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
            eStart = chart.pointer.normalize(eStart);

            var posX = eStart.chartX,
                posY = eStart.chartY,
                alpha = chart.options.chart.options3d.alpha,
                beta = chart.options.chart.options3d.beta,
                sensitivity = 5, // lower is more sensitive
                handlers = [];

            function drag(e) {
                // Get e.chartX and e.chartY
                e = chart.pointer.normalize(e);

                chart.update({
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
        H.addEvent(chart.container, 'mousedown', dragStart);
        H.addEvent(chart.container, 'touchstart', dragStart);
    }(Highcharts));

}


var render3DPose = function (pose) {

    while (chart.series.length > 0) {
        chart.series[0].remove(true);
    }

    for (let i = 0; i < connections.length; i++) {
        const c = connections[i];

        var c_series = {
            name: 'Data',
            colorByPoint: true,
            marker: {
                symbol: 'circle',
                enabled: true,
            },
            accessibility: {
                exposeAsGroupOnly: true
            },
            lineWidth: 2,
            lineColor: c['color'],
            data: [pose[c['start']], pose[c['end']]]
        }

        chart.addSeries(c_series, false);
    }

    chart.redraw();

};


function adjustPlotSize() {
    chart.setSize(null, null);
}
