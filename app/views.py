import os
import uuid
import cv2
import json
import asyncio

from aiohttp_jinja2 import template
from aiohttp import web

from dope import DopeEstimator
from compare import compare_poses
from .main import input_queue

@template('index.html')
async def index(request):
    return {}

async def user_video(request):
    post = await request.post()
    user_video = post.get("video")
    master_video_id = post.get("video_id")

    master_results_path = os.path.join(request.app['settings'].tmp_data_path, "{}.json".format(master_video_id))

    with open(master_results_path) as json_file:
        master_results = json.load(json_file)

    filename = "tmp_data/{}_user.mp4".format(video_id)

    if user_video:
        with open(filename, 'wb') as fd:
             video_content = user_video.file.read()
             fd.write(video_content)

    cap = cv2.VideoCapture(filename)
    user_results = []

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    counter = 1

    while(cap.isOpened()):
        ret, frame = cap.read()
        if not ret:
            break

        frame = resize_image(frame, width=self.default_width)

        user_results.append(self.dope.run(frame, visualize=False))
        print(f"frame {counter} of {total_frames}")

        counter += 1
    cap.release()

    response = json.dumps(user_results, cls=NumpyEncoder)
    with open(os.join("tmp_data", "{}_user.json".format(video_id)), "w") as f:
        f.write(response)

    return web.json_response({"test": "test"})

async def master_video(request):
    post = await request.post()
    video = post.get("video")
    video_id = str(uuid.uuid4())

    # tmpfile = "tmp_data/0004.mp4.json"
    # if os.path.exists(tmpfile):
    #     print("Responded with cached poses")
    #     response = open(tmpfile).read()
    #     return web.json_response(response)

    filename = "tmp_data/{}.mp4".format(video_id)

    if video:
        with open(filename, 'wb') as fd:
             video_content = video.file.read()
             fd.write(video_content)

        input_queue.put({'video_id': video_id, 'filename': filename})

    return web.json_response({'id': video_id})
