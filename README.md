# MyCalAgent — Movement preview

Static prototype. Three files, no build step, no dependencies to install.

- `index.html` — landing page, links to both demos
- `mockup.html` — clickable app mockup (no camera needed)
- `camera.html` — live pose tracking via MediaPipe BlazePose (needs camera + https)

## Publishing on GitHub Pages

1. Create a new **public** repo (a private repo needs a paid plan for Pages).
2. Upload these files to the repo root.
3. Settings → Pages → Source: *Deploy from a branch* → Branch: `main`, folder: `/ (root)` → Save.
4. Wait ~1 minute. The URL is `https://<username>.github.io/<repo>/`

`camera.html` requires an https origin for camera access — GitHub Pages serves
https, so it works there. It will not work from a `file://` path on a phone.

Nothing is uploaded by `camera.html`: video frames are processed in the browser
and discarded. Only the MediaPipe model file is fetched, once, from Google's CDN.
