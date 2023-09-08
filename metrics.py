import json
import logging
import sys

logging.basicConfig(stream=sys.stdout, level=logging.INFO)


class Logger:

    def __init__(self):
        self._metric = logging.getLogger("metric")
        _metric_formatter = logging.Formatter('METRIC\t%(message)s')
        _metric_sh = logging.StreamHandler(stream=sys.stdout)
        _metric_sh.setLevel(logging.DEBUG)
        _metric_sh.setFormatter(_metric_formatter)
        self._metric.handlers.clear()
        self._metric.addHandler(_metric_sh)
        # stop propagting to root logger
        self._metric.propagate = False

        self._log = logging.getLogger("log")
        _log_formatter = logging.Formatter('LOG\t%(levelname)s\t%(message)s')
        _log_sh = logging.StreamHandler(stream=sys.stdout)
        _log_sh.setLevel(logging.DEBUG)
        _log_sh.setFormatter(_log_formatter)
        self._log.handlers.clear()
        self._log.addHandler(_log_sh)
        # stop propagting to root logger
        self._log.propagate = False

    def _to_json(self, obj):
        try:
            return json.dumps(obj, default=str)
        except Exception:
            import traceback
            self._log.error(traceback.format_exc())
            return None

    def _send(self, msg):
        s = self._to_json(msg)
        if s is not None:
            self._metric.info(s)

    def trace_count(self, metric_name, count, **fields):
        msg = {
            'metric_type': 'count',
            'metric_name': metric_name,
            'count': count,
            **fields,
        }
        self._send(msg)

    def trace_gauge(self, metric_name, value, **fields):
        msg = {
            'metric_type': 'gauge',
            'metric_name': metric_name,
            'value': value,
            **fields,
        }
        self._send(msg)

    def trace_duration(self, metric_name, duration_in_ms, **fields):
        msg = {
            'metric_type': 'duration',
            'metric_name': metric_name,
            'duration': duration_in_ms,
            **fields,
        }
        self._send(msg)

    def logger(self):
        return self._log


log = Logger()
