var FOOT_LEFT = 0
var FOOT_RIGHT = 1
var KNEE_LEFT = 2
var KNEE_RIGHT = 3
var HIP_LEFT = 4
var HIP_RIGHT = 5
var HAND_LEFT = 6
var HAND_RIGHT = 7
var ELBOW_LEFT = 8
var ELBOW_RIGHT = 9
var SHOULDER_LEFT = 10
var SHOULDER_RIGHT = 11
var HEAD = 12
var HIP = 13
var NECK = 14

function create_point(point_1, point_2) {
    tmp_x = (point_1[0] + point_2[0]) / 2
    tmp_y = (point_1[1] + point_2[1]) / 2
    tmp_z = (point_1[2] + point_2[2]) / 2

    return [tmp_x, tmp_y, tmp_z]
}

var connections = [{
        "start": FOOT_LEFT,
        "end": KNEE_LEFT,
        "color": 'black'
    },
    {
        "start": FOOT_RIGHT,
        "end": KNEE_RIGHT,
        "color": 'red'
    },
    {
        "start": KNEE_LEFT,
        "end": HIP_LEFT,
        "color": 'black'
    },
    {
        "start": KNEE_RIGHT,
        "end": HIP_RIGHT,
        "color": 'red'
    },
    {
        "start": HIP_LEFT,
        "end": HIP,
        "color": 'black'
    },
    {
        "start": HIP,
        "end": HIP_RIGHT,
        "color": 'red'
    },
    {
        "start": HAND_LEFT,
        "end": ELBOW_LEFT,
        "color": 'black'
    },
    {
        "start": HAND_RIGHT,
        "end": ELBOW_RIGHT,
        "color": 'red'
    },
    {
        "start": ELBOW_LEFT,
        "end": SHOULDER_LEFT,
        "color": 'black'
    },
    {
        "start": ELBOW_RIGHT,
        "end": SHOULDER_RIGHT,
        "color": 'red'
    },
    {
        "start": SHOULDER_LEFT,
        "end": NECK,
        "color": 'black'
    },
    {
        "start": NECK,
        "end": SHOULDER_RIGHT,
        "color": 'red'
    },
    {
        "start": HIP,
        "end": NECK,
        "color": 'black'
    },
    {
        "start": NECK,
        "end": HEAD,
        "color": 'black'
    }
]

test_poses_3d = [
    [
        [-0.026362305507063866, -1.0756406784057617, 0.022719785571098328],
        [-0.04605294018983841, -1.0560132265090942, -0.21098102629184723],
        [0.021797962486743927, -0.6709030866622925, 0.008712551556527615],
        [-0.008582084439694881, -0.6500832438468933, -0.1707308143377304],
        [0.04375193640589714, -0.2591544985771179, 0.04380892589688301],
        [-0.012432866729795933, -0.24371308088302612, -0.10188546031713486],
        [0.12927189469337463, -0.23931941390037537, 0.2272799015045166],
        [0.031365636736154556, -0.23555462062358856, -0.27645036578178406],
        [0.042356736958026886, -0.05076343193650246, 0.2356870323419571],
        [-0.05830378085374832, -0.03092336840927601, -0.23119981586933136],
        [0.02588953636586666, 0.21971331536769867, 0.1836429387331009],
        [-0.057206034660339355, 0.2366817593574524, -0.1503886878490448],
        [0.024774540215730667, 0.42447686195373535, 0.017075996845960617]
    ],
    [
        [-0.025923624634742737, -1.0578049421310425, 0.1287347674369812],
        [-0.052095264196395874, -1.0635521411895752, -0.08158552646636963],
        [0.05211295560002327, -0.6592305898666382, 0.08081742376089096],
        [0.009676210582256317, -0.6569722890853882, -0.10791036486625671],
        [0.04797868803143501, -0.25105875730514526, 0.07752273231744766],
        [-0.010173835791647434, -0.2536674439907074, -0.0858384519815445],
        [0.1254393458366394, -0.23072296380996704, 0.24692600965499878],
        [-0.0033373574260622263, -0.2393006980419159, -0.28229302167892456],
        [0.03852042555809021, -0.03188030794262886, 0.2251056432723999],
        [-0.06819751113653183, -0.03754578158259392, -0.2241353839635849],
        [0.034305278211832047, 0.24060477316379547, 0.16850149631500244],
        [-0.06362318247556686, 0.23077256977558136, -0.16195593774318695],
        [0.06548061966896057, 0.4235081672668457, -0.01646478660404682]
    ],
    [
        [-0.024107083678245544, -1.046714186668396, 0.13625362515449524],
        [-0.07049456238746643, -1.0590200424194336, -0.0590926855802536],
        [0.07943514734506607, -0.6584283113479614, 0.08245240151882172],
        [0.010719146579504013, -0.6576552987098694, -0.09852956980466843],
        [0.05406361073255539, -0.25233718752861023, 0.07856839150190353],
        [-0.00534515967592597, -0.25515854358673096, -0.0853644385933876],
        [0.10346353054046631, -0.22595521807670593, 0.2598904073238373],
        [-0.02808084711432457, -0.23842135071754456, -0.284192830324173],
        [0.018583107739686966, -0.029066210612654686, 0.22607789933681488],
        [-0.08086440712213516, -0.034326620399951935, -0.21882320940494537],
        [0.027010478079319, 0.24184530973434448, 0.17027969658374786],
        [-0.06686913967132568, 0.231423482298851, -0.16117529571056366],
        [0.06109118461608887, 0.42216312885284424, -0.013769431971013546]
    ]
]

for (let i = 0; i < test_poses_3d.length; i++) {
    const pose = test_poses_3d[i];
    pose.push(create_point(pose[HIP_LEFT], pose[HIP_RIGHT]))
    pose.push(create_point(pose[SHOULDER_LEFT], pose[SHOULDER_RIGHT]))
}




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
var chart = new Highcharts.Chart({
    chart: {
        renderTo: 'container',
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


var renderPose = function(slideEvt) {
    var timestep = slider.getValue();
    if (slideEvt != null) {
        $("#slider_value").text(slideEvt.value);
    }

    while(chart.series.length > 0){
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
            data: [test_poses_3d[timestep][c['start']], test_poses_3d[timestep][c['end']]]
        }

        chart.addSeries(c_series, false);
    }

    chart.redraw();

};

var slider = $("#slider").slider({
    min: 0,
    max: test_poses_3d.length - 1,
    value: 0
}).on('slide', renderPose).data('slider');

renderPose(null)