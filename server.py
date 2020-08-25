import argparse
import asyncio
import json
import logging
import io
import os
import PIL
import sys
import json
import ssl
import uuid
import cv2
import numpy as np
import datetime
import time
from queue import Queue

from aiohttp import web
from av import VideoFrame
from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder

ROOT = os.path.dirname(__file__)
sys.path.append(os.path.join(ROOT, '..', 'dope'))

from util import resize_image
from dope import DopeEstimator

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.float32):
            return float(obj)
        elif isinstance(obj, np.bool_):
            return bool(obj)
        return json.JSONEncoder.default(self, obj)

logger = logging.getLogger("pc")
pcs = set()

input_queue = Queue()
output_queue = Queue()

class VideoTransformTrack(MediaStreamTrack):
    """
    A video stream track that transforms frames from an another track.
    """

    kind = "video"

    def __init__(self, track, transform):
        super().__init__()  # don't forget this!
        self.track = track
        self.transform = transform

    async def recv(self):
        frame = await self.track.recv()

        img = frame.to_ndarray(format="bgr24")

        input_queue.put(img)

        new_frame = VideoFrame.from_ndarray(img, format="bgr24")
        new_frame.pts = frame.pts
        new_frame.time_base = frame.time_base
        return new_frame

async def index(request):
    content = open(os.path.join(ROOT, "index.html"), "r").read()
    return web.Response(content_type="text/html", text=content)

async def image(request):
    post = await request.post()
    image = post.get("image")

    filename = "tmp_data/{}.mp4".format(uuid.uuid4())
    if image:
         with open(filename, 'wb') as fd:
             img_content = image.file.read()
             fd.write(img_content)

    cap = cv2.VideoCapture(filename)
    result = []

    counter = 0
    while(cap.isOpened() and counter < 5):
        ret, frame = cap.read()
        if not ret:
            break

        # TODO half comp args? and model path args?
        dope = DopeEstimator('../dope/models/DOPErealtime_v1_0_0.pth.tgz', use_half_comp=False)

        # TODO which value for width or height?
        frame = resize_image(frame, width=640)

        result.append(dope.run(frame, visualize=False))
        print("frame")

        counter += 1



    print("finished")
    return web.json_response(json.dumps(result, cls=NumpyEncoder))


async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = RTCPeerConnection()
    pc_id = "PeerConnection(%s)" % uuid.uuid4()
    pcs.add(pc)

    def log_info(msg, *args):
        logger.info(pc_id + " " + msg, *args)

    log_info("Created for %s", request.remote)

    # prepare local media
    player = MediaPlayer(os.path.join(ROOT, "demo-instruct.wav"))
    recorder = MediaBlackhole()

    @pc.on("datachannel")
    def on_datachannel(channel):
        @channel.on("message")
        def on_message(message):
            if isinstance(message, str) and message.startswith("ping"):
                channel.send("pong" + message[4:])
                if not output_queue.empty():
                    channel.send("shape: {}".format(output_queue.get()))

    @pc.on("iceconnectionstatechange")
    async def on_iceconnectionstatechange():
        log_info("ICE connection state is %s", pc.iceConnectionState)
        if pc.iceConnectionState == "failed":
            await pc.close()
            pcs.discard(pc)

    @pc.on("track")
    def on_track(track):
        log_info("Track %s received", track.kind)

        if track.kind == "audio":
            pc.addTrack(player.audio)
            recorder.addTrack(track)
        elif track.kind == "video":
            local_video = VideoTransformTrack(
                track, transform=params["video_transform"]
            )
            pc.addTrack(local_video)

        @track.on("ended")
        async def on_ended():
            log_info("Track %s ended", track.kind)
            await recorder.stop()

    # handle offer
    await pc.setRemoteDescription(offer)
    await recorder.start()

    # send answer
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.Response(
        content_type="application/json",
        text=json.dumps(
            {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
        ),
    )

async def on_shutdown(app):
    # close peer connections
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()


def run_server(debug=False, port=8080):

    if debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    ssl_context = None

    app = web.Application(client_max_size=1028**4)
    app.on_shutdown.append(on_shutdown)

    app.add_routes([web.static('/static', 'static')])

    app.router.add_get("/", index)
    app.router.add_post("/offer", offer)
    app.router.add_post("/image", image)

    web.run_app(app, access_log=None, port=port, ssl_context=ssl_context)
