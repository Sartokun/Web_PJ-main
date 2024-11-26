// ฟังก์ชันสำหรับอ่านคุกกี้
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function initializeProfilePic() {
    const username = getCookie('username');
    const profilePic = getCookie('img');

    const loginButton = document.getElementById('button-profile');

    if (username && profilePic) {
        loginButton.classList.add('logged-in');
        loginButton.innerHTML = `<a href="profile.html"><img src="profilePic/${profilePic}" alt="Profile" id="profilePic"></a>`;
        loginButton.href = "profile.html";
    }

    document.getElementById('button_logout').addEventListener('click', function(event) {
        event.preventDefault(); // ป้องกันการรีเฟรชหน้าเมื่อคลิก
    
        // ส่งคำขอ GET ไปยัง '/logout' เพื่อเคลียร์คุกกี้
        fetch('/logout', {
            method: 'GET',
            credentials: 'same-origin'  // ส่งคุกกี้ไปพร้อมคำขอ (ถ้ามี)
        })
        .then(response => {
            if (response.ok) {
                window.location.href = 'login.html';  // เปลี่ยนเส้นทางไปหน้า login
            } else {
                console.log("Logout failed");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });    
}

window.addEventListener('load', initializeProfilePic);