import threading
import time
import cv2
import os
import sys
import json
import shutil

ROOT = os.path.dirname(__file__)
sys.path.append(os.path.join(ROOT, '..', '..', 'dope'))

from dope import DopeEstimator
from util import resize_image, NumpyEncoder

class DopeThread(object):

    def __init__(self, input_queue, model_path, use_half_computation, default_width, debug, interval=1):
        self.interval = interval
        self.input_queue = input_queue
        self.default_width = default_width

        # self.debug_folder = os.path.join(ROOT, "..", "tmp_data", str(time.time()))
        # os.makedirs(self.debug_folder)
        # self.debug = debug

        self.dope = DopeEstimator(model_path, use_half_comp=use_half_computation)

        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True
        thread.start()

    def run(self):
        while True:
            if not self.input_queue.empty():
                while not self.input_queue.empty():
                    data = self.input_queue.get()

                video_id = data['video_id']
                filename = data['filename']

                tmpfile = "../input/0004.mp4.json"
                if os.path.isfile(tmpfile):
                    shutil.copy(tmpfile, f"tmp_data/{video_id}.json")
                    continue

                cap = cv2.VideoCapture(filename)
                result = []

                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                counter = 1

                while(cap.isOpened()):
                    ret, frame = cap.read()
                    if not ret:
                        break

                    frame = resize_image(frame, width=self.default_width)

                    result.append(self.dope.run(frame, visualize=False))
                    print(f"frame {counter} of {total_frames}")

                    counter += 1
                cap.release()

                response = json.dumps(result, cls=NumpyEncoder)
                with open(os.path.join("tmp_data", "{}.json".format(video_id)), "w") as f:
                    f.write(response)

                print("finished")

            else:
                time.sleep(self.interval)
