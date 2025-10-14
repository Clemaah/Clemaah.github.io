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
        let engine;
        switch (project.type) {
            case "unity":
                engine = `<li class="unity"><img src="src/icons/Unity.svg" alt="Unity Logo" /><strong>Unity</strong></li>`;
                break;
            case "unreal":
                engine = `<li class="unreal"><img src="src/icons/Unreal.svg" alt="Unreal Engine Logo" /><strong>Unreal</strong></li>`;
                break;
            default:
                engine = `<li class="board"><img src="src/icons/Board.svg" alt="Board Game Logo" /><strong>Board Game</strong></li>`;

        }

        let links = `<ul class="links">`;
        if(project.links.discord) {
            links += `<li>
                <a class="iconLink" draggable="false" href="${project.links.discord}" target="_blank" title="Discord"><span class="icon discord"></span></a></li>`;
        }
        if(project.links.itch) {
            links += `<li>
                <a class="iconLink" draggable="false" href="${project.links.itch}" target="_blank" title="Itch.io"><span class="icon itch"></span></a></li>`;
        }
        if(project.links.download) {
            links += `<li>
                <a class="iconLink" draggable="false" href="${project.links.download}" target="_blank" title="Download"><span class="icon download"></span></a></li>`;
        }
        links += `</ul>`;

        let figure = "<figure>";
        switch (project.src_type) {
            case "youtube":
                figure += `<iframe type="text/html" src="${project.src_link}" alt="${project.src_alt}" title="${project.src_alt}" frameborder="0"></iframe>`;
                break;
            default:
                figure += `<img draggable="false" src="${project.src_link}" alt="${project.src_alt}" />`;
        }
        figure += "</figure>";

        const section = document.createElement("section");
        section.className = "slide";
        section.innerHTML = `
            <aside>${figure}</aside>
            <article>
                <h2>${project.title}</h2>
                <ul class="projectInfos">
                    ${engine}
                    <li class="state"><img src="src/icons/Tag.svg" alt="Tag" /><strong>${project.state}</strong></li>
                    <li class="duration"><img src="src/icons/Hourglass.svg" alt="Duration" /><strong>${project.duration}</strong></li>
                </ul>
                <div class="descriptionSection">
                    <h3>Pitch</h3>
                    <p>${project.description.pitch}</p>
                </div>
                <div class="descriptionSection">
                    <h3>Context</h3>
                    <p>${project.description.context}</p>
                </div>
                <div class="descriptionSection">
                    <h3>My work</h3>
                    <p>${project.description.work}</p>
                </div>

                ${links}
            </article>
        `;
        carousel.appendChild(section);

        const menuItem = document.createElement("li");
        i += 1;
        menuItem.dataset.index = i;
        menuItem.innerHTML = `
            <img draggable="false" src="${project.icon_link}" alt="${project.icon_alt}" title="${project.icon_alt}" />
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

    if(document.querySelector('#menu ul').offsetWidth <= window.innerWidth) {
        document.querySelector('#menu ul').style.transform = `translateX(0px)`;
    }
    else {
        var translateX = -(realIndex + 1 - (totalSlides - 1) / 2) * document.querySelector('#menu li:first-child').offsetWidth;
        document.querySelector('#menu ul').style.transform = `translateX(${translateX}px)`;
    }
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
