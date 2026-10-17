# Repeat the Alba ball-view comparison on the RTX PC

Reviewed: 2026-10-18. Prepared reproduction instructions, not a measured Windows/CUDA
result. The [Mac Alba trial](ALBA_TRACKING_TRIAL_2026-10-18.md) owns findings; the
[feature guide](../app/src/features/match-recognition/README.md) owns the tools.

## Inputs and environment

Pull the latest `main` in your ArenaVoca checkout (`git pull --ff-only origin main`).
The repository includes `track.py`, `ball_views.py`, `audit_ball_views.py`,
`compare_tracking.py`, `tracking-requirements.txt` and the numeric reference points.
No transfer archive is required. Git contains no private recording, frame sequence,
model weights or credentials. Mac virtual environments are not portable to Windows.

Keep the private recording at `app/public/media/user/barca-2018-h264.mp4`. Its SHA-256
must be `16450bd54c298888f4506383ac98e5b09fc4dd96a736b733ca47e0401b37b638`
for this timestamp comparison. Confirm with `Get-FileHash` before treating another
file as the same sequence. FFmpeg/ffprobe and Python 3.12 are required.

From `app/`, create a separate environment:

```powershell
py -3.12 -m venv content-source/match-analysis/.venv-tracking
$trackingPython = ".\content-source\match-analysis\.venv-tracking\Scripts\python.exe"
```

Install a CUDA-enabled PyTorch/torchvision pair into **this environment** using
the [official PyTorch Windows/Pip/Python/CUDA selector](https://pytorch.org/get-started/locally/).
Use `$trackingPython -m pip` in place of the selector's `pip` command. The Mac's
installed wheel and Ollama's GPU support do not establish that Python can use CUDA.
Then install the remaining pinned experiment tools and test a real CUDA operation:

```powershell
& $trackingPython -m pip install -r src/features/match-recognition/tracking-requirements.txt
& $trackingPython -c "import torch; print(torch.__version__, torch.version.cuda); assert torch.cuda.is_available(), 'CUDA unavailable'; print(torch.cuda.get_device_name(0)); a=torch.ones((8,8),device='cuda'); print((a@a)[0,0].item())"
```

If the CUDA check fails, resolve the PyTorch wheel/driver combination before
benchmarking. `track.py --device cuda` also executes a kernel and fails explicitly;
it never silently substitutes CPU processing. Exact Windows dependency compatibility
and RTX throughput remain to be verified on that PC.

## Same source, three views

Run sequentially, with Qwen stopped during detection to separate the GPU stages:

```powershell
& $trackingPython src/features/match-recognition/track.py --video public/media/user/barca-2018-h264.mp4 --start 808 --duration 20 --model small --device cuda --fps 25 --threshold 0.1 --ball-view full --download-weights
& $trackingPython src/features/match-recognition/track.py --video public/media/user/barca-2018-h264.mp4 --start 808 --duration 20 --model small --device cuda --fps 25 --threshold 0.1 --ball-view crop
& $trackingPython src/features/match-recognition/track.py --video public/media/user/barca-2018-h264.mp4 --start 808 --duration 20 --model small --device cuda --fps 25 --threshold 0.1 --ball-view tiles
```

Each invocation prints a fresh ignored output directory. `summary.json` records
the checkpoint hash, device, CUDA build/device capability, sampled frame count,
processing time and CUDA peak allocated/reserved memory. `tracking.json` contains
source timestamps and observed boxes/IDs. The full view uses one detector call per
frame; the central crop uses two including full-frame people; four overlapping
tiles use five. Keep default inference/precision settings unchanged for this accuracy
comparison; evaluate precision/export optimisations separately.

For point audits, Git includes the six **Codex AI** reference positions from the Mac
experiment in `src/features/match-recognition/fixtures/alba-ball-reference-points.json`
(relative to `app/`). These numeric inspection aids contain no images and are not
human ground truth. From `app/`, replace the run placeholders:

```powershell
& $trackingPython src/features/match-recognition/audit_ball_views.py --points src/features/match-recognition/fixtures/alba-ball-reference-points.json --output content-source/match-analysis/rtx-point-audit.json content-source/match-analysis/recognition/tracking/FULL/tracking.json content-source/match-analysis/recognition/tracking/CROP/tracking.json content-source/match-analysis/recognition/tracking/TILES/tracking.json
```

Compare the source-aligned ball hits, off-ball candidates and identity breaks,
especially around 814.4–815.4. More candidates or uninterrupted false tracks are
not better ball accuracy. A central crop excludes other parts of the image;
tiled coverage retains the whole scene at extra compute cost.

## Qwen and evidence handoff

After detection, run the [paired local comparison](../app/src/features/match-recognition/README.md#rf-detr--bytetrack-offline-comparison--18-october-2026)
with the selected new `tracking.json`, local Whisper Small directory and the same
Qwen3-VL 8B instruct checkpoint. A fresh paired Windows run is separate from the
Mac timing result. Keep raw responses even when review rejects them, and verify
the cutback against source imagery rather than accepting an action label alone.

Retain private `summary.json`, `tracking.json`, audit output and comparison folders
locally. Record Windows/CUDA execution success, actual GPU use, latency and action
quality separately from automated software tests. No whole-match run, model training,
cloud upload or card publication is required for this experiment.
