function showScreen(className) {
    document.querySelector(".welcome-page").style.display = "none";
    document.querySelector(".nudge-flashcard").style.display = "none";
    document.querySelector(".nudge-quiz").style.display = "none";
    
    document.querySelector(`.${className}`).style.display = "block";
}