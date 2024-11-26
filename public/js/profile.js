function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

window.onload = () => {
    const username = getCookie('username');
    const profilePic = getCookie('img');

    if (!username || !profilePic) {
        // ถ้าไม่มี cookie ให้กลับไปที่หน้า home.html
        window.location.href = "home.html";
        return;
    }

    // ตั้งค่าโปรไฟล์รูปภาพ
    const imgElement = document.getElementById("My-icon");
    imgElement.src = `/profilepic/${profilePic}`;
    // imgElement.src = `profilePic/${profilePic}`;

    // ตั้งค่าข้อความต้อนรับ
    const namePart = decodeURIComponent(username).split('@')[0]; // ตรวจสอบ encoding
    const profileDetails = document.querySelector(".profile-details h1");
    profileDetails.textContent = `Hello, ${namePart}!`;

        // ------------------------------------------------------------------
        imgElement.addEventListener("click", () => {
            document.getElementById('fileField').click(); // เปิดตัวเลือกไฟล์
        });
    
        document.getElementById("fileField").addEventListener("change", async () => {
            const formData = new FormData(document.getElementById("formId"));
            try {
                const response = await fetch('/profilepic', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
        
                if (result.success) {
                    // ถ้าอัปโหลดสำเร็จ, รีเฟรชหรืออัปเดตรูปโปรไฟล์
                    const imgElement = document.getElementById("My-icon");
                    imgElement.src = `/profilepic/${result.img}?t=${new Date().getTime()}`;
                    // imgElement.src = `/profilepic/${result.filename}?t=${new Date().getTime()}`; // เพิ่ม query string เพื่อรีเฟรชภาพ
                    alert('Profile picture updated successfully!');
                } else {
                    alert('Failed to upload profile picture');
                    console.error(result.message);
                }
            } catch (error) {
                alert('An error occurred while uploading the image');
                console.error('Error:', error);
            }
        });
        // ----------------------------

};

async function fetchParticipatedEvents() {
    try {
        const userId = getCookie('userId'); // ดึง userId จากคุกกี้

        if (!userId) {
            console.log('User not logged in');
            return;
        }

        const response = await fetch(`/api/participatedEvents?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch participated events: ${response.status}`);
        }

        const data = await response.json();
        const events = data.events;

        const eventContainer = document.getElementById('eventContainer');
        if (!eventContainer) {
            console.error('Event container not found');
            return;
        }

        if (events.length > 0) {
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

                // สร้าง Popup container
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
            eventContainer.innerHTML = '<p>No events participated in yet.</p>';
        }
    } catch (err) {
        console.error('Error fetching participated events:', err);
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

    if (!popup.classList.contains('show')) {
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

// ฟังก์ชันสร้าง Event
async function createEvent(event) {
    event.preventDefault(); // หยุดการส่งฟอร์มปกติ

    // ดึงค่าจากฟอร์ม
    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventDescription = document.getElementById('eventDescription').value;

    // ตรวจสอบว่าฟอร์มครบถ้วน
    if (!eventName || !eventDate || !eventDescription) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        // ส่งข้อมูลไปยัง backend
        const response = await fetch('/api/create_events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: eventName,
                date: eventDate,
                description: eventDescription,
                image_path: 'pic/Monster1_Colour.png', // สามารถปรับเปลี่ยนได้หากมีระบบอัปโหลดรูปภาพ
            }),
        });

        if (response.ok) {
            alert("Event created successfully!");
            // รีโหลดหน้าเพื่ออัปเดตข้อมูล
            window.location.reload();
        } else {
            const errorMessage = await response.text();
            console.error('Error creating event:', errorMessage);
            alert("Failed to create event: " + errorMessage);
        }
    } catch (err) {
        console.error('Error creating event:', err);
        alert("An error occurred while creating the event. Please try again.");
    }
}

window.addEventListener('load', fetchParticipatedEvents);
window.addEventListener('load', document.getElementById('eventForm').addEventListener('submit', createEvent));