from queue import Queue
import threading
import time
import cv2
import numpy as np
import os
import sys

ROOT = os.path.dirname(__file__)
sys.path.append(os.path.join(ROOT, '..', 'dope'))

from server import run_server, input_queue, output_queue
from dope import DopeEstimator

class DopeThread(object):

    def __init__(self, input_queue, output_queue, interval=1):
        self.interval = interval
        self.input_queue = input_queue
        self.output_queue = output_queue

        self.dope = DopeEstimator('../dope/models/DOPErealtime_v1_0_0.pth.tgz', use_half_comp=False)

        thread = threading.Thread(target=self.run, args=())
        thread.daemon = True
        thread.start()

    def run(self):
        while True:
            if not self.input_queue.empty():
                img = self.input_queue.get()

                results = self.dope.run(img, visualize=False)

                self.output_queue.put(results)

            else:
                time.sleep(self.interval)

if __name__ == "__main__":

    dope_thread = DopeThread(input_queue, output_queue)
    run_server()
