let currentIndex = 0;

function pageLoad() {
    const gameContents = document.querySelectorAll(".Game-Content");
    const badgeImages = document.querySelectorAll(".badge-image");
    const bgContainer = document.getElementById("bgContainer");

    // ตั้งค่าให้หมุนไปที่ content ต่อไปทุก ๆ 10 วินาที
    setInterval(() => {
        let nextIndex = (currentIndex + 1) % gameContents.length;
        showContent(nextIndex, gameContents, badgeImages, bgContainer);
    }, 10000);
}

function showContent(index, gameContents, badgeImages, bgContainer) {
    // ซ่อนหรือแสดง content ตาม index ที่เลือก
    gameContents.forEach((content, idx) => {
        if (index === idx) {
            content.classList.add("show");
        } else {
            content.classList.remove("show");
        }
    });

    // เปลี่ยนพื้นหลังตาม content ที่เลือก
    const newBg = gameContents[index].getAttribute("data-bg");
    console.log('New background:', newBg); // ตรวจสอบค่า newBg
    bgContainer.style.backgroundImage = newBg;

    // เปลี่ยนสถานะ badge
    badgeImages.forEach((badge, idx) => {
        if (index === idx) {
            badge.classList.add("active");
        } else {
            badge.classList.remove("active");
        }
    });

    // อัปเดต currentIndex
    currentIndex = index;
}


function selectContent(index) {
    const gameContents = document.querySelectorAll(".Game-Content");
    const badgeImages = document.querySelectorAll(".badge-image");
    const bgContainer = document.getElementById("bgContainer");

    showContent(index, gameContents, badgeImages, bgContainer);
}

window.addEventListener('load', pageLoad);

async function fetchInfos() {
    try {
        const limit = 3;
        const response = await fetch(`/api/infos?limit=${limit}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status}`);
        }

        const events = await response.json();

        if (Array.isArray(events) && events.length > 0) {
            const eventContainer = document.getElementById('eventContainer');
            if (!eventContainer) {
                console.error('Event container not found');
                return;
            }

            events.sort((a, b) => new Date(b.date) - new Date(a.date));

            events.forEach((event, index) => {
                const contentDiv = document.createElement('div');
                contentDiv.classList.add('content-' + (index + 1));

                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toISOString().split('T')[0];

                const truncatedDescription = event.description.length > 100
                    ? event.description.substring(0, 100) + '...'
                    : event.description;

                contentDiv.innerHTML = `
                    <div class="text-content kanit-regular">
                        <img src="${event.image_path || 'pic/Monster1_Colour.png'}" alt="Event Image">
                        <div>
                            <p class="date">${formattedDate}</p>
                            <h3>${event.name}</h3>
                            <p>${truncatedDescription}</p>
                            <a class="button content_details" href="javascript:void(0);" onclick="showPopup('popup-content-${index}')">Details</a>
                        </div>
                    </div>
                `;
                eventContainer.appendChild(contentDiv);

                // Create Popup container
                const popupContainer = document.createElement('div');
                popupContainer.id = `popup-content-${index}`;
                popupContainer.classList.add('popup-content');
                popupContainer.innerHTML = `
                    <img class="img" src="${event.image_path || 'pic/Monster1_Colour.png'}" alt="pic" />
                    <div class="text-popup kanit-regular">
                        <p class="date">${formattedDate}</p>
                        <div class="detailContentInPopup">
                            <h3>${event.name}</h3>
                            <hr>
                            <p>${event.description}</p>
                        </div>
                    </div>
                `;
                document.body.appendChild(popupContainer);
            });
        } else {
            document.getElementById('eventContainer').innerHTML = '<p>No events available</p>';
        }
    } catch (err) {
        console.error('Error fetching events:', err);
    }
}

function showPopup(popupId) {
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');
    document.body.appendChild(overlay);

    const popup = document.getElementById(popupId);
    if (!popup) {
        console.error(`Popup with id ${popupId} not found`);
        return;
    }

    console.log('Show popup:', popupId);  // ตรวจสอบว่ามีการเรียกใช้งาน
    // ตรวจสอบว่า popup มีการเพิ่มคลาส "show" หรือไม่
    if (!popup.classList.contains('show')) {
        console.log('Adding show class to popup');
        popup.classList.add('show');
    }

    overlay.addEventListener('click', () => hidePopup(popupId));
}

function hidePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.classList.remove('show');
    }

    const overlay = document.querySelector('.popup-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// เรียกใช้งานเมื่อโหลดเสร็จ
window.addEventListener('load', fetchInfos);

