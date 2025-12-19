/* =====================================================
   SteamKotakLegends - Main JavaScript
   Animations, 3D effects, and interactions
   ===================================================== */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initParticles();
    initScrollReveal();
    init3DTilt();
    initSmoothScroll();
});

/* ----- Navigation ----- */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu on link click
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

/* ----- Particle Background ----- */
let mouseX = -1000;
let mouseY = -1000;

// Track mouse position globally
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

document.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
});

function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class with smooth response
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = 0;
            this.vy = 0;
            this.baseSize = Math.random() * 1.5 + 0.5;
            this.size = this.baseSize;
            this.baseOpacity = Math.random() * 0.35 + 0.15;
            this.opacity = this.baseOpacity;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.color = this.getRandomColor();
            this.hue = Math.random() * 60 + 250; // Purple range
        }

        getRandomColor() {
            const colors = [
                'rgba(139, 92, 246,',   // Purple
                'rgba(167, 139, 250,',  // Light Purple
                'rgba(196, 181, 253,',  // Lavender
                'rgba(124, 58, 237,'    // Violet
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            // Calculate distance from mouse
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 180;

            // Smooth response - particles react to cursor proximity
            if (distance < maxDistance && distance > 0) {
                const intensity = 1 - (distance / maxDistance);

                // Smooth push away with easing
                const angle = Math.atan2(dy, dx);
                const pushForce = intensity * 3;

                this.vx += -Math.cos(angle) * pushForce * 0.1;
                this.vy += -Math.sin(angle) * pushForce * 0.1;

                // Increase size and opacity when near cursor
                this.size = this.baseSize + (intensity * 1.5);
                this.opacity = Math.min(0.8, this.baseOpacity + (intensity * 0.3));
            } else {
                // Smoothly return to base state
                this.size += (this.baseSize - this.size) * 0.05;
                this.opacity += (this.baseOpacity - this.opacity) * 0.05;
            }

            // Apply velocity with friction (smooth movement)
            this.vx *= 0.95;
            this.vy *= 0.95;

            // Add base drift
            this.x += this.speedX + this.vx;
            this.y += this.speedY + this.vy;

            // Wrap around edges
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;
        }

        draw() {
            // Subtle glow effect
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `${this.color} ${this.opacity * 0.15})`;
            ctx.fill();

            // Core particle
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `${this.color} ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create MORE particles
    const particleCount = Math.min(200, Math.floor((canvas.width * canvas.height) / 8000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Connect nearby particles with better visibility
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    // Check if near mouse for enhanced connection
                    const midX = (particles[i].x + particles[j].x) / 2;
                    const midY = (particles[i].y + particles[j].y) / 2;
                    const mouseDistance = Math.sqrt((mouseX - midX) ** 2 + (mouseY - midY) ** 2);

                    let opacity = (1 - distance / 120) * 0.2;

                    // Brighter lines near cursor
                    if (mouseDistance < 150) {
                        opacity = (1 - distance / 120) * 0.5;
                    }

                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                    ctx.lineWidth = mouseDistance < 150 ? 1 : 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        connectParticles();
        animationId = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
    });
}

/* ----- Scroll Reveal Animation ----- */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.feature-card, .step-card, .section-header, .cta-card'
    );

    // Add reveal class
    revealElements.forEach(el => {
        el.classList.add('reveal');
    });

    // Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Add staggered delay for grid items
                const siblings = entry.target.parentElement.querySelectorAll('.reveal');
                siblings.forEach((sibling, index) => {
                    sibling.style.transitionDelay = `${index * 0.1}s`;
                });
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
}

/* ----- 3D Tilt Effect ----- */
function init3DTilt() {
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach(card => {
        // Add shine overlay element
        const shine = document.createElement('div');
        shine.classList.add('card-shine');
        shine.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: inherit;
            pointer-events: none;
            background: radial-gradient(
                circle at var(--shine-x, 50%) var(--shine-y, 50%),
                rgba(139, 92, 246, 0.15) 0%,
                transparent 60%
            );
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        card.style.position = 'relative';
        card.appendChild(shine);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation (stronger effect)
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            // Calculate shine position
            const shineX = (x / rect.width) * 100;
            const shineY = (y / rect.height) * 100;

            // Apply 3D transform
            card.style.transform = `
                perspective(800px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg)
                translateY(-10px)
                scale(1.03)
            `;
            card.style.transition = 'transform 0.1s ease-out';

            // Update shine position
            shine.style.setProperty('--shine-x', `${shineX}%`);
            shine.style.setProperty('--shine-y', `${shineY}%`);
            shine.style.opacity = '1';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            card.style.transition = 'transform 0.4s ease-out';
            shine.style.opacity = '0';
        });
    });

    // Hero mockup 3D effect
    const mockup = document.querySelector('.app-mockup');
    if (mockup) {
        const heroVisual = document.querySelector('.hero-visual');

        heroVisual.addEventListener('mousemove', (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 30;
            const rotateY = (centerX - x) / 30;

            mockup.style.transform = `rotateY(${-5 + rotateY}deg) rotateX(${5 + rotateX}deg)`;
        });

        heroVisual.addEventListener('mouseleave', () => {
            mockup.style.transform = 'rotateY(-5deg) rotateX(5deg)';
        });
    }
}

/* ----- Smooth Scroll ----- */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ----- Parallax Effect on Scroll ----- */
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    // Parallax for floating orbs
    const orbs = document.querySelectorAll('.orb');
    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 0.05;
        orb.style.transform = `translateY(${scrolled * speed}px)`;
    });

    // Parallax for floating cards
    const floatCards = document.querySelectorAll('.float-card');
    floatCards.forEach((card, index) => {
        const speed = (index + 1) * 0.03;
        const baseAnimation = Math.sin(Date.now() / 1000 + index) * 10;
        card.style.transform = `translateY(${baseAnimation - scrolled * speed}px)`;
    });
});


