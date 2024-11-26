function openRole(evt, chName) {
    var i, tabcontent, tabdirectory;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tabdirectory = document.getElementsByClassName("tabdirectory");
    for (i = 0; i < tabdirectory.length; i++) {
        tabdirectory[i].className = tabdirectory[i].className.replace(" active", "");
    }

    document.getElementById(chName).style.display = "flex";

    evt.currentTarget.className += " active";
}
// function showPopup() {
//     const overlay = document.createElement('div');
//     overlay.classList.add('popup-overlay');
//     document.body.appendChild(overlay);

//     const popup = document.getElementById('popup');
//     popup.style.display = 'block';

//     overlay.addEventListener('click', hidePopup);
// }

// function hidePopup() {
//     const popup = document.getElementById('popup');
//     popup.style.display = 'none';

//     const overlay = document.querySelector('.popup-overlay');
//     overlay.remove();
// }
function showPopup(popupId) {
    // สร้าง overlay
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');
    document.body.appendChild(overlay);

    const popup = document.getElementById(popupId);
    popup.style.display = 'block';

    overlay.addEventListener('click', () => hidePopup(popupId));
}

function hidePopup(popupId) {

    const popup = document.getElementById(popupId);
    popup.style.display = 'none';

    const overlay = document.querySelector('.popup-overlay');
    if (overlay) {
        overlay.remove();
    }
}
