// --- Variables ---/
const carousel = document.getElementById("carousel");
const menu = document.querySelector("#menu ul");
let currentIndex = 1;
const transitionDuration = 800;

let isDragging = false;
let isTransitionning = false;
let startX = 0;
let deltaX = 0;

let slides, menuItems, totalSlides;


// Load projects from JSON
let i = 1;
fetch('projects.json')
.then(response => response.json())
.then(projects => {
    projects.forEach(project => {
        const section = document.createElement("section");
        const figure = document.createElement("figure");
        switch (project.src_type) {
            case "youtube":
                figure.innerHTML = `<iframe src="${project.src_link}" alt="${project.src_alt}" title="${project.src_alt}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
                break;
            default:
                figure.innerHTML = `<img src="${project.src_link}" alt="${project.src_alt}" />`;

        }
        section.className = "slide";
        section.innerHTML = `
            <aside>${figure.innerHTML}</aside>
            <article>
                <h2>${project.title}</h2>
                <p>${project.description.join("</p><p>")}</p>
            </article>
        `;
        carousel.appendChild(section);

        const menuItem = document.createElement("li");
        i += 1;
        menuItem.dataset.index = i;
        menuItem.innerHTML = `
            <img src="${project.icon_link}" alt="${project.icon_alt}" title="${project.icon_alt}" />
        `;
        menu.appendChild(menuItem);
    });

    // Duplicata for infinite loop
    let lastChild = carousel.lastChild.cloneNode(true);
    let firstChild = carousel.firstElementChild.cloneNode(true);
    carousel.insertBefore(lastChild, carousel.firstElementChild);
    carousel.appendChild(firstChild);

    init();
});


// Carrousel initialization
function init() {
    slides = document.querySelectorAll('.slide');
    menuItems = document.querySelectorAll('#menu li');
    totalSlides = slides.length;

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            currentIndex = parseInt(item.dataset.index);
            updateSlide();
        });
    });

    updateSlide(true);
}







// === Slide transition logic ===
function updateSlide(instant = false) {
    isTransitionning = !instant;
    carousel.style.transition = instant ? 'none' : `transform ${transitionDuration}ms ease-in-out`;
    carousel.style.transform = `translateX(-${currentIndex * 100}vw)`;

    updateMenu();
}

function goToSlide(index) {
    if(isTransitionning === false) {
        currentIndex = index;
        updateSlide();
    }
}

carousel.addEventListener('transitionend', () => {
    if (currentIndex === 0) {
        currentIndex = totalSlides - 2;
        updateSlide(true);
    }
    else if (currentIndex === totalSlides - 1) {
        currentIndex = 1;
        updateSlide(true);
    }
    isTransitionning = false;
});

// === Arrow & keyboard nav ===
document.querySelector('.next').addEventListener('click', () => goToSlide(currentIndex + 1));
document.querySelector('.prev').addEventListener('click', () => goToSlide(currentIndex - 1));
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
});

// === Menu nav ===

function updateMenu() {
    const realIndex = (currentIndex - 1 + (totalSlides - 2)) % (totalSlides - 2);
    menuItems.forEach((item, idx) => {
        item.classList.toggle('active', idx === realIndex);
    });
}

// === Swipe gestures ===
carousel.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX;
    document.body.classList.add('grabbing');
});

carousel.addEventListener('mousemove', e => {
    if (!isDragging) return;
    deltaX = e.clientX - startX;
});

carousel.addEventListener('mouseup', () => {
    if (!isDragging) return;
    if (deltaX > 50) goToSlide(currentIndex - 1);
    else if (deltaX < -50) goToSlide(currentIndex + 1);
    isDragging = false;
    deltaX = 0;
    document.body.classList.remove('grabbing');
});

carousel.addEventListener('mouseleave', () => {
    if (isDragging) {
        isDragging = false;
        deltaX = 0;
        document.body.classList.remove('grabbing');
    }
});

// Touch (mobile)
carousel.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
}, { passive: true });

carousel.addEventListener('touchmove', e => {
    deltaX = e.touches[0].clientX - startX;
}, { passive: true });

carousel.addEventListener('touchend', () => {
    if (deltaX > 50) goToSlide(currentIndex - 1);
    else if (deltaX < -50) goToSlide(currentIndex + 1);
    deltaX = 0;
});
