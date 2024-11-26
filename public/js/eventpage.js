var slideIndex = 1;
var autoSlideInterval;
var tameSlide = 5000;

function plusDivs(n) {
    showDivs(slideIndex += n);
}

function currentDiv(n) {
    showDivs(slideIndex = n);
}

function showDivs(n) {
    var i;
    var x = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("demo");
    if (n > x.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = x.length }
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" white", "");
    }
    x[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " white";

    restartAutoSlide();
}

function autoSlide() {
    plusDivs(1);
}

function restartAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(autoSlide, tameSlide);
}

window.addEventListener('load', restartAutoSlide());

// ฟังก์ชั่นเพื่อดึงค่า userId จาก cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// ฟังก์ชั่นสำหรับการเข้าร่วมกิจกรรม
async function joinEvent(userId, eventId, button) {
    if (!userId) {
        // ถ้าไม่มี userId ใน cookie ให้แจ้งเตือนและไปที่หน้า login.html
        alert('กรุณาเข้าสู่ระบบ');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/api/joinEvent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, eventId }),
        });

        if (response.ok) {
            button.textContent = 'เข้าร่วมแล้ว';
            button.disabled = true;
            alert('เข้าร่วมกิจกรรมสำเร็จ!');
        } else if (response.status === 409) {
            alert('คุณได้เข้าร่วมอีเวนต์นี้แล้ว');
        } else {
            throw new Error('Error joining event');
        }
    } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาด');
    }
}

// ฟังก์ชั่นเช็คว่า userId เข้าร่วมกิจกรรมหรือไม่
async function checkUserParticipation(userId, eventId) {
    const response = await fetch(`/api/participatedEvents?userId=${userId}&eventId=${eventId}`);
    if (response.ok) {
        const data = await response.json();
        return data.isParticipated;
    }
    return false;
}

// ฟังก์ชั่นดึงข้อมูลกิจกรรม
async function fetchEvents() {
    try {
        const userId = getCookie('userId'); // ดึง userId จาก cookie

        const limit = 0;
        const response = await fetch(`/api/events?limit=${limit}`);

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

            for (const [index, event] of events.entries()) {
                const contentDiv = document.createElement('div');
                contentDiv.classList.add('content-' + (index + 1));

                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toISOString().split('T')[0];

                const truncatedDescription = event.description.length > 100
                    ? event.description.substring(0, 100) + '...'
                    : event.description;

                // เช็คว่าผู้ใช้ได้เข้าร่วมกิจกรรมแล้วหรือไม่
                const isParticipated = await checkUserParticipation(userId, event.id);
                console.log(isParticipated);

                contentDiv.innerHTML = `
                    <div class="text-content">
                        <img src="${event.image_path || 'pic/Monster1_Colour.png'}" alt="Event Image">
                        <div>
                            <p class="date">${formattedDate}</p>
                            <h3>${event.name}</h3>
                            <p>${truncatedDescription}</p>
                            <a class="button content_details" href="javascript:void(0);" onclick="showPopup_Event('popup-content-${index}')">Details</a>
                        </div>
                    </div>
                `;
                eventContainer.appendChild(contentDiv);

                // สร้าง Popup container
                const popupContainer = document.createElement('div');
                popupContainer.id = `popup-content-${index}`;
                popupContainer.classList.add('popup-content');
                popupContainer.innerHTML = `
                    <img class="img" src="${event.image_path || 'pic/Monster1_Colour.png'}" alt="pic" />
                    <div class="text-popup">
                        <p class="date">${formattedDate}</p>
                        <div class="detailContentInPopup">
                            <h3>${event.name}</h3>
                            <hr>
                            <p>${event.description}</p>
                        </div>
                        <a class="button content_details" href="javascript:void(0);" onclick="joinEvent('${userId}', '${event.id}', this)">
                                ${isParticipated ? 'เข้าร่วมแล้ว' : 'Join'}
                        </a>
                    </div>
                `;
                document.body.appendChild(popupContainer);
            }
        } else {
            document.getElementById('eventContainer').innerHTML = '<p>No events available</p>';
        }
    } catch (err) {
        console.error('Error fetching events:', err);
    }
}

function showPopup_Event(popupId) {
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

async function fetchInfos() {
    try {
        const limit = 0;
        const response = await fetch(`/api/infos?limit=${limit}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status}`);
        }

        const events = await response.json();

        if (Array.isArray(events) && events.length > 0) {
            const eventContainer = document.getElementById('infoContainer');
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
                    <div class="text-content">
                        <img src="${event.image_path || 'pic/Monster1_Colour.png'}" alt="Event Image">
                        <div>
                            <p class="date">${formattedDate}</p>
                            <h3>${event.name}</h3>
                            <p>${truncatedDescription}</p>
                            <a class="button content_details" href="javascript:void(0);" onclick="showPopup_info('info-popup-${index}')">Details</a>
                        </div>
                    </div>
                `;
                eventContainer.appendChild(contentDiv);

                // Create Popup container for info
                const popupContainer = document.createElement('div');
                popupContainer.id = `info-popup-${index}`;
                popupContainer.classList.add('popup-content');
                popupContainer.innerHTML = `
                    <img class="img" src="${event.image_path || 'pic/Monster1_Colour.png'}" alt="pic" />
                    <div class="text-popup">
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
            document.getElementById('infoContainer').innerHTML = '<p>No infos available</p>';
        }
    } catch (err) {
        console.error('Error fetching infos:', err);
    }
}

function showPopup_info(popupId) {
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

window.addEventListener('load', fetchEvents);
window.addEventListener('load', fetchInfos);
