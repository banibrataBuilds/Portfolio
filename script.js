// Force page to load from the top on refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

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

// Magic Wand Cursor Logic
const magicCursor = document.querySelector('[data-magic-cursor]');

let lastSparkleTime = 0;

window.addEventListener('mousemove', function (e) {
    if (magicCursor.classList.contains('hidden')) {
        magicCursor.classList.remove('hidden');
    }

    const posX = e.clientX;
    const posY = e.clientY;

    // Move the wand directly to the cursor
    magicCursor.style.left = `${posX}px`;
    magicCursor.style.top = `${posY}px`;

    // Throttle sparkle creation for performance
    const now = Date.now();
    if (now - lastSparkleTime > 30) {
        createSparkle(posX, posY);
        lastSparkleTime = now;
    }
});

// Hide cursor when leaving the window
document.addEventListener('mouseleave', () => magicCursor.classList.add('hidden'));
document.addEventListener('mouseenter', () => magicCursor.classList.remove('hidden'));

// Add click effect
window.addEventListener('mousedown', () => magicCursor.classList.add('clicking'));
window.addEventListener('mouseup', () => magicCursor.classList.remove('clicking'));

// Hover effect for clickables
const clickables = document.querySelectorAll('a, button, .btn, .icon-btn');
clickables.forEach(clickable => {
    clickable.addEventListener('mouseenter', () => magicCursor.classList.add('hovering'));
    clickable.addEventListener('mouseleave', () => magicCursor.classList.remove('hovering'));
});

// Function to create a dropping sparkle
function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    document.body.appendChild(sparkle);

    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;

    // Dynamic magical colors
    const colors = ['#ffff66', '#ff9933', '#ff3366', '#ffcc00', '#ff0055'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sparkle.style.background = randomColor;
    sparkle.style.boxShadow = `0 0 8px ${randomColor}, 0 0 15px #ff3366`;

    // Randomize movement: fall down and drift slightly with wider spread
    const moveX = (Math.random() - 0.5) * 100;
    const moveY = (Math.random() * 100) + 30;

    sparkle.animate([
        { transform: `translate(0, 0) scale(1) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${moveX}px, ${moveY}px) scale(0) rotate(180deg)`, opacity: 0 }
    ], {
        duration: 800 + Math.random() * 600,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        fill: 'forwards'
    });

    // Cleanup
    setTimeout(() => sparkle.remove(), 1500);
}

// Reveal Animation on Scroll
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Optional: To make it repeat every time, remove the unobserve
            // observer.unobserve(entry.target); 
        }
    });
}, {
    root: null,
    threshold: 0.15,
});

revealElements.forEach(el => revealObserver.observe(el));
