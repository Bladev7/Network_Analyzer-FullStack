import speedtest
import time
import statistics
from ping3 import ping



class SpeedTester:
    def __init__(self, tests=3):  # constructor to define variables for object
        self.tests = tests
        self.downloads = []
        self.uploads = []
        self.pings = []
        self.st = None  # object created here to be shared
        self.server_found = False  # variable to check if server is already found

    def init_speedtest(self):
        if self.st is not None:
            return True

        for i in range(3):
            try:
                self.st = speedtest.Speedtest()
                return True
            except Exception as e:
                print(f"Speedtest init failed (attempt {i + 1}): {e}")
                time.sleep(2)

        return False

    def find_server(self):

        print("Updating ping and locking best server...")

        if not self.init_speedtest():
            print("Speedtest init failed. Skipping server selection.")
            return

        try:
            self.st.get_best_server()
            self.server_found = True
        except Exception as e:
            print(f"Server selection failed: {e}")

    def run_download_test(self):  # function to run only download tests
        self.find_server()  # make sure server is found first
        print("Running download test...")

        for i in range(self.tests):
            print(f"Download Test {i + 1}...")

            download = self.st.download() / 1_000_000  # divide to convert from bits to megabit
            ping = self.st.results.ping

            self.downloads.append(download)  # storing values to original array of self object
            self.pings.append(ping)

    def run_upload_test(self):  # function to run only upload tests
        self.find_server()  # make sure server is found first
        print("Running upload test...")

        for i in range(self.tests):
            print(f"Upload Test {i + 1}...")

            upload = self.st.upload() / 1_000_000  # note that upload local variables only for function

            self.uploads.append(upload)  # storing values to original array of self object

    @staticmethod
    def measure_quality(samples=10, host="8.8.8.8"):
        ping_times = []
        lost = 0

        for _ in range(samples):
            result = ping(host, timeout=1)

            if result:
                ping_times.append(result * 1000)
            else:
                lost += 1

            time.sleep(0.2)

        # packet loss
        packet_loss = (lost / samples) * 100

        # jitter
        jitter = 0
        if len(ping_times) > 1:
            jitter = statistics.stdev(ping_times)

        return {
            "jitter": round(jitter, 2),
            "packet_loss": round(packet_loss, 2)
        }

    def get_download_results(self):  # function
        if not self.downloads:
            return None

        avg_download = sum(self.downloads) / len(self.downloads)  # divide sum/number of elements
        avg_ping = sum(self.pings) / len(self.pings)

        # returning key value of pairs String:value
        return {
            "download": round(avg_download),  # rounds results to remove seperators in number
            "ping": round(avg_ping)
        }

    def get_upload_results(self):  # function
        if not self.uploads:
            return None

        avg_upload = sum(self.uploads) / len(self.uploads)

        return {
            "upload": round(avg_upload)
        }


if __name__ == "__main__":
    # Create the object
    tester = SpeedTester(tests=1)

    # Run download test first
    tester.run_download_test()
    dl_results = tester.get_download_results()

    if dl_results:
        print(f"Download: {dl_results['download']} Mbps")
        print(f"Ping: {dl_results['ping']} ms")

    # Run upload test second
    tester.run_upload_test()
    ul_results = tester.get_upload_results()

    if ul_results:
        print(f"Upload: {ul_results['upload']} Mbps")