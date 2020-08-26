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