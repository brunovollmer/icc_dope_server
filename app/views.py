import cv2
import uuid
import json
import os
import sys

from aiortc import RTCPeerConnection, RTCSessionDescription
from aiohttp_jinja2 import template
from aiohttp import web

from dope import DopeEstimator
from util import resize_image, NumpyEncoder

from .web_rtc import VideoTransformTrack
from .main import pcs, logger, output_queue

@template('index.html')
async def index(request):
    return {}

@template('test.html')
async def test(request):
    return {}

@template('layout_test.html')
async def layout_test(request):
    return {}

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

    while(cap.isOpened()):
        ret, frame = cap.read()
        if not ret:
            break

        model_path = request.app['settings'].model_path
        use_half_computation = request.app['settings'].use_half_computation
        default_width = request.app['settings'].default_width

        dope = DopeEstimator(model_path, use_half_comp=use_half_computation)

        frame = resize_image(frame, width=default_width)

        result.append(dope.run(frame, visualize=False))
        print("frame")

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
            local_video = VideoTransformTrack(track)
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
