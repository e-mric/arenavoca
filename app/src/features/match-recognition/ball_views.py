"""Deterministic ball-inference crops, mapped back into the source image."""
import math


def source_windows(width, height, mode):
    """Return source-pixel windows; no hand-labelled ball positions are inputs."""
    if any(type(n) is not int or n < 4 for n in (width, height)):
        raise ValueError('Image dimensions must be integers of at least four pixels.')
    if mode == 'full':
        return [(0, 0, width, height)]
    if mode == 'crop':
        return [(width // 4, height // 4, width - width // 4, height - height // 4)]
    if mode == 'tiles':
        tile_w, tile_h = math.ceil(width * .6), math.ceil(height * .6)
        return [(x, y, x + tile_w, y + tile_h)
                for y in (0, height - tile_h) for x in (0, width - tile_w)]
    raise ValueError('Unknown ball view mode.')


def restore_boxes(boxes, window):
    """Crop inference reports crop-pixel coordinates; offset, never renormalize twice."""
    x, y, right, bottom = window
    if right <= x or bottom <= y:
        raise ValueError('Empty crop.')
    restored = []
    for box in boxes:
        if len(box) != 4 or not all(math.isfinite(float(v)) for v in box):
            raise ValueError('Invalid crop box.')
        x1, y1, x2, y2 = [float(v) for v in box]
        if x2 <= x1 or y2 <= y1:
            raise ValueError('Invalid crop box extent.')
        restored.append([x1 + x, y1 + y, x2 + x, y2 + y])
    return restored


def detect_ball_views(model, rgb, threshold, mode):
    """Keep full-frame person detections; vary only the ball-inference view."""
    import numpy as np
    import supervision as sv

    full = model.predict(rgb, threshold=threshold)
    if mode == 'full':
        return full[np.isin(full.class_id, [1, 37])].with_nms(threshold=.5)
    height, width = rgb.shape[:2]
    people = full[full.class_id == 1]
    # RF-DETR attaches per-detection class-name data. All merged views must use
    # the same numeric evidence contract rather than mixing vendor data fields.
    parts = [sv.Detections(xyxy=people.xyxy.copy(), class_id=people.class_id.copy(),
                           confidence=people.confidence.copy())]
    for window in source_windows(width, height, mode):
        x1, y1, x2, y2 = window
        observed = model.predict(rgb[y1:y2, x1:x2].copy(), threshold=threshold)
        balls = observed[observed.class_id == 37]
        parts.append(sv.Detections(
            xyxy=np.asarray(restore_boxes(balls.xyxy, window), dtype=np.float32).reshape(-1, 4),
            class_id=balls.class_id.copy(), confidence=balls.confidence.copy()))
    return sv.Detections.merge(parts).with_nms(threshold=.5)
