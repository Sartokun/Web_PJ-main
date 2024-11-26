window.onload = pageLoad;

function pageLoad(){
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if (urlParams.get("error") == 1) {
        let errorMessage = "An error occurred.";
        if (window.location.href.includes("register.html")) {
            errorMessage = "Passwords do not match!";
        } else if (window.location.href.includes("login.html")) {
            errorMessage = "Invalid username or password.";
        }
        document.getElementById('errordisplay').innerHTML = errorMessage;
    }
}