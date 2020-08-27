import threading
import time
import cv2
import os
import sys


ROOT = os.path.dirname(__file__)
sys.path.append(os.path.join(ROOT, '..', '..', 'dope'))

from dope import DopeEstimator
from util import resize_image

class DopeThread(object):

    def __init__(self, input_queue, output_queue, model_path, use_half_computation, default_width, debug, interval=1):
        self.interval = interval
        self.input_queue = input_queue
        self.output_queue = output_queue
        self.default_width = default_width

        self.debug_folder = os.path.join(ROOT, "..", "tmp_data", str(time.time()))
        os.makedirs(self.debug_folder)
        self.debug = debug

        self.dope = DopeEstimator(model_path, use_half_comp=use_half_computation)

        self.counter = 0

        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True
        thread.start()

    def run(self):
        while True:
            if not self.input_queue.empty():
                img = self.input_queue.get()
                while not self.input_queue.empty():
                    img = self.input_queue.get()

                img = resize_image(img, width=self.default_width)

                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

                results, result_img = self.dope.run(img, visualize=self.debug)

                if self.debug:
                    #print(os.path.join(self.debug_folder), "{:05d}.png".format(self.counter))
                    cv2.imwrite(os.path.join(self.debug_folder, "{:05d}.png".format(self.counter)), result_img)

                self.output_queue.put(results)

                self.counter += 1

            else:
                time.sleep(self.interval)
