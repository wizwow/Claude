// Game configuration
const CONFIG = {
    bubbleMinSize: 30,
    bubbleMaxSize: 80,
    bubbleSpawnRate: 1000, // ms
    bubbleLifetime: 3000, // ms
    minBubbleLifetime: 1500, // ms
    goldenChance: 0.1, // 10% chance
    comboTimeout: 1000, // ms
    difficultyIncrease: 0.98, // multiply spawn rate
    particleCount: 15
};

// Game state
let canvas, ctx;
let bubbles = [];
let particles = [];
let score = 0;
let combo = 1;
let maxCombo = 1;
let highscore = localStorage.getItem('bubblePopHighscore') || 0;
let gameRunning = false;
let spawnInterval;
let currentSpawnRate = CONFIG.bubbleSpawnRate;
let comboTimer = null;
let missedBubbles = 0;
let maxMissed = 10;

// Bubble class
class Bubble {
    constructor() {
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = canvas.height + 50;
        this.radius = Math.random() * (CONFIG.bubbleMaxSize - CONFIG.bubbleMinSize) + CONFIG.bubbleMinSize;
        this.targetY = Math.random() * (canvas.height - 150) + 50;
        this.speed = 2 + Math.random() * 2;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.02 + Math.random() * 0.03;
        this.lifetime = CONFIG.bubbleLifetime - (score * 5); // Faster disappear as score increases
        this.lifetime = Math.max(this.lifetime, CONFIG.minBubbleLifetime);
        this.createdAt = Date.now();
        this.isGolden = Math.random() < CONFIG.goldenChance;
        this.opacity = 1;

        // Color
        if (this.isGolden) {
            this.hue = 45; // Gold
        } else {
            this.hue = Math.random() * 360;
        }
    }

    update() {
        // Move up
        if (this.y > this.targetY) {
            this.y -= this.speed;
        }

        // Wobble
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.5;

        // Fade out near end of lifetime
        const elapsed = Date.now() - this.createdAt;
        const timeLeft = this.lifetime - elapsed;

        if (timeLeft < 500) {
            this.opacity = timeLeft / 500;
        }

        return timeLeft > 0;
    }

    draw() {
        // Shadow
        ctx.save();
        ctx.globalAlpha = this.opacity * 0.3;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(this.x + 5, this.y + 5, this.radius, this.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Bubble gradient
        ctx.save();
        ctx.globalAlpha = this.opacity;

        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );

        if (this.isGolden) {
            gradient.addColorStop(0, `hsla(${this.hue}, 100%, 80%, 0.9)`);
            gradient.addColorStop(0.5, `hsla(${this.hue}, 100%, 60%, 0.7)`);
            gradient.addColorStop(1, `hsla(${this.hue}, 100%, 40%, 0.3)`);
        } else {
            gradient.addColorStop(0, `hsla(${this.hue}, 100%, 80%, 0.8)`);
            gradient.addColorStop(0.5, `hsla(${this.hue}, 100%, 60%, 0.6)`);
            gradient.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0.2)`);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Shine ring
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    isClicked(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }
}

// Particle class for pop effect
class Particle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.radius = Math.random() * 4 + 2;
        this.hue = hue;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // Gravity
        this.life -= this.decay;
        return this.life > 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Update highscore display
    document.getElementById('highscore').textContent = highscore;

    // Mouse click event
    canvas.addEventListener('click', handleClick);

    // Restart button
    document.getElementById('restartBtn').addEventListener('click', restartGame);

    // Start game
    startGame();
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

function startGame() {
    gameRunning = true;
    score = 0;
    combo = 1;
    maxCombo = 1;
    bubbles = [];
    particles = [];
    missedBubbles = 0;
    currentSpawnRate = CONFIG.bubbleSpawnRate;

    updateScore();
    updateCombo();

    document.getElementById('gameOver').classList.remove('show');

    spawnBubble();
    gameLoop();
}

function spawnBubble() {
    if (!gameRunning) return;

    bubbles.push(new Bubble());

    // Increase difficulty
    currentSpawnRate *= CONFIG.difficultyIncrease;
    currentSpawnRate = Math.max(currentSpawnRate, 300); // Minimum spawn rate

    setTimeout(spawnBubble, currentSpawnRate);
}

function handleClick(event) {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

    let hit = false;

    for (let i = bubbles.length - 1; i >= 0; i--) {
        if (bubbles[i].isClicked(mouseX, mouseY)) {
            const bubble = bubbles[i];
            hit = true;

            // Create particles
            for (let j = 0; j < CONFIG.particleCount; j++) {
                particles.push(new Particle(bubble.x, bubble.y, bubble.hue));
            }

            // Update score
            const points = bubble.isGolden ? 20 : 10;
            score += points * combo;

            // Update combo
            combo++;
            if (combo > maxCombo) maxCombo = combo;

            updateScore();
            updateCombo();

            // Reset combo timer
            clearTimeout(comboTimer);
            comboTimer = setTimeout(() => {
                combo = 1;
                updateCombo();
            }, CONFIG.comboTimeout);

            // Remove bubble
            bubbles.splice(i, 1);
            break;
        }
    }

    if (!hit) {
        // Missed click, reset combo
        combo = 1;
        updateCombo();
        clearTimeout(comboTimer);
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;

    if (score > highscore) {
        highscore = score;
        localStorage.setItem('bubblePopHighscore', highscore);
        document.getElementById('highscore').textContent = highscore;
    }
}

function updateCombo() {
    const comboElement = document.getElementById('combo');
    comboElement.textContent = `x${combo}`;

    if (combo > 5) {
        comboElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            comboElement.style.transform = 'scale(1)';
        }, 200);
    }
}

function gameLoop() {
    if (!gameRunning) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#87ceeb');
    bgGradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw bubbles
    for (let i = bubbles.length - 1; i >= 0; i--) {
        if (!bubbles[i].update()) {
            bubbles.splice(i, 1);
            missedBubbles++;

            if (missedBubbles >= maxMissed) {
                endGame();
                return;
            }
        } else {
            bubbles[i].draw();
        }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) {
            particles.splice(i, 1);
        } else {
            particles[i].draw();
        }
    }

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameRunning = false;

    document.getElementById('finalScore').textContent = score;
    document.getElementById('maxCombo').textContent = `x${maxCombo}`;
    document.getElementById('gameOver').classList.add('show');
}

function restartGame() {
    startGame();
}

// Start when page loads
window.addEventListener('load', init);
