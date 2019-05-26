function showPopUp(title, msg, alertCallback, confirmCallback) {
    $('.popUpTitle').html(title);
    $('.popUpMsg').html(msg);
    $('.popUp').show();
    
    if (confirmCallback) {
        $("#closeButton").hide();
        $("#yesButton, #noButton").show();
        $("#yesButton, #noButton").unbind("click");
        $("#yesButton").on("click", function() {
            confirmCallback(true);
            hidePopUp();
        });
        $("#noButton").on("click", function() {
            confirmCallback(false);
            hidePopUp();
        });
    } else {
        if (alertCallback) {
            $("#closeButton").unbind("click");
            $("#closeButton").on("click", function() {
                alertCallback();
            });
        }
        $("#yesButton, #noButton").hide();
        $("#closeButton").show();
    }
}

function hidePopUp() {
    $('.popUpTitle').html('');
    $('.popUpMsg').html('');
    $('.popUp').hide();
}
