import os
import uuid
import cv2
import json
import time
import numpy as np
import asyncio

from aiohttp_jinja2 import template
from aiohttp import web

from dope import DopeEstimator
from compare import find_ideal_offset
from util import resize_image, NumpyEncoder
from .main import input_queue

@template('index.html')
async def index(request):
    return {}

async def user_video(request):
    post = await request.post()
    user_video = post.get("video")
    master_video_id = post.get("video_id")

    master_results_path = os.path.join(request.app['settings'].tmp_data_path, "{}.json".format(master_video_id))

    while not os.path.isfile(master_results_path):
        time.sleep(1)

    model_path = request.app['settings'].model_path
    use_half_computation = request.app['settings'].use_half_computation
    default_width = request.app['settings'].default_width

    dope = DopeEstimator(model_path, use_half_comp=use_half_computation)

    with open(master_results_path) as json_file:
        print("[user_video] Loading computed master poses")
        master_results = json.load(json_file)
        if len(master_results) > 0:
            frame = 0
            while frame < len(master_results) and len(master_results[frame]["body"]) == 0:
                frame += 1
            if len(master_results[frame]["body"]) == 13:
                print("ADDING POINTS")
                master_results = dope._compute_hip_neck(master_results)

    filename = os.path.join("tmp_data", "{}_user.mp4".format(master_video_id))

    if user_video:
        with open(filename, 'wb') as fd:
             video_content = user_video.file.read()
             fd.write(video_content)

    tmp_userfile = "../input/user.mp4.json"
    if os.path.isfile(tmp_userfile):
        print("[user_video] Loading cached user poses")
        user_results = json.load(open(tmp_userfile))
    else:
        print("[user_video] Compute user poses")
        cap = cv2.VideoCapture(filename)
        user_results = []

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        counter = 1

        while(cap.isOpened()):
            ret, frame = cap.read()
            if not ret:
                break

            frame = resize_image(frame, width=default_width)

            res, _ = dope.run(frame, visualize=False)
            user_results.append(res)
            print(f"frame {counter} of {total_frames}")

            counter += 1
        cap.release()

    response = json.dumps(user_results, cls=NumpyEncoder)
    with open(os.path.join("tmp_data", "{}_user.json".format(master_video_id)), "w") as f:
        f.write(response)

    nr_master_poses = len(master_results)
    master_poses = np.zeros((nr_master_poses, 15, 3))
    user_poses = np.zeros((nr_master_poses, 15, 3))

    for i in range(nr_master_poses):
        if master_results[i]['body']:
            master_poses[i] = np.array(master_results[i]['body'][0]['pose3d'])
        if i < len(user_results) and user_results[i]['body']:
            user_poses[i] = np.array(user_results[i]['body'][0]['pose3d'])


    scores, best_offset, new_master_poses, new_user_poses = find_ideal_offset(
        master_poses,
        user_poses,
        timeshift_percentage=request.app["settings"].timeshift_percentage,
        thresholds=request.app["settings"].thresholds
    )

    new_user_results = []

    for i in range(new_master_poses.shape[0]):
        if np.sum(new_user_poses[i]) == 0:
            new_user_results.append({'body': []})
        else:
            new_user_results.append(user_results[(i + best_offset)])

    response = {
        "master_results": master_results,
        "user_results": new_user_results,
        "scores": scores
    }
    return web.json_response(json.dumps(response, cls=NumpyEncoder))

async def master_video(request):
    post = await request.post()
    video = post.get("video")
    video_id = str(uuid.uuid4())
    video_name = post.get("video_name")

    filename = "tmp_data/{}.mp4".format(video_id)

    if video:
        with open(filename, 'wb') as fd:
             video_content = video.file.read()
             fd.write(video_content)

        input_queue.put({'video_id': video_id, 'filename': filename, 'video_name': video_name})

    return web.json_response({'id': video_id})
