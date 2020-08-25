import asyncio
import json
import logging
import os
import sys
import uuid
import cv2
from queue import Queue
from pathlib import Path
import aiohttp_jinja2
from aiohttp_jinja2 import template
import jinja2
from aiohttp import web
from av import VideoFrame
from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription

ROOT = os.path.dirname(__file__)
THIS_DIR = Path(__file__).parent
sys.path.append(os.path.join(ROOT, '..', '..', 'dope'))

from util import resize_image, NumpyEncoder
from dope import DopeEstimator
from app.dope_thread import DopeThread

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

@template('index.jinja')
async def index(request):

    return {}

# async def index(request):
#     content = open(os.path.join(ROOT, "index.html"), "r").read()
#     return web.Response(content_type="text/html", text=content)

async def video(request):
    post = await request.post()
    video = post.get("video")

    filename = "tmp_data/{}.mp4".format(uuid.uuid4())
    if video:
         with open(filename, 'wb') as fd:
             video_content = video.file.read()
             fd.write(video_content)

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

        if track.kind == "video":
            local_video = VideoTransformTrack(
                track, transform=params["video_transform"]
            )
            pc.addTrack(local_video)

        @track.on("ended")
        async def on_ended():
            log_info("Track %s ended", track.kind)

    # handle offer
    await pc.setRemoteDescription(offer)

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


async def create_app(debug=False, port=8080):

    if debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    ssl_context = None

    app = web.Application(client_max_size=1028**4)
    app.on_shutdown.append(on_shutdown)

    jinja2_loader = jinja2.FileSystemLoader(str(THIS_DIR / 'templates'))
    aiohttp_jinja2.setup(app, loader=jinja2_loader)

    app.add_routes([web.static('/static', 'static')])

    app.router.add_get("/", index)
    app.router.add_post("/offer", offer)
    app.router.add_post("/video", video)

    dope_thread = DopeThread(input_queue, output_queue)

    #web.run_app(app, access_log=None, port=port, ssl_context=ssl_context)

    return app
