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

@template('index.jinja')
async def index(request):
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
