const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");

// The number of frames in the folder (0001 to 0240)
const frameCount = 240;

// Path matches the structure: /video_frames_24fps/frame_0001.png
const currentFrame = index => (
    `./video_frames_24fps/frame_${(index + 1).toString().padStart(4, '0')}.png`
);

// Preload all images to prevent flickering/loading delays while scrolling
const images = [];
const preloadImages = () => {
    for (let i = 0; i < frameCount; i++) {
        images[i] = new Image();
        images[i].src = currentFrame(i);
    }
};

const img = new Image();
img.src = currentFrame(0);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Helper to draw image using object-fit: cover equivalent logic on canvas
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,
        nh = ih * r,
        cx, cy, cw, ch, ar = 1;

    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
    nw *= ar;
    nh *= ar;

    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

img.onload = function () {
    drawImageProp(context, img, 0, 0, canvas.width, canvas.height);
}

const updateImage = index => {
    if (images[index]) {
        drawImageProp(context, images[index], 0, 0, canvas.width, canvas.height);
    }
}

// Attach scroll event listener
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;

    // Map scroll fraction to a specific frame index
    const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
    );

    requestAnimationFrame(() => updateImage(frameIndex));
});

// Ensure canvas stays the same size as window on resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
    const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
    );

    updateImage(frameIndex);
});

preloadImages();
