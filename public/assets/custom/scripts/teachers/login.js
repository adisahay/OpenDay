$(document).ready(function() {
    $("#submitUsername").click(function() {
        if (!$("#username").val()) {
            $("#errorMessage").fadeOut();
            $("#errorMessage").html("Please enter a phone number")
            $("#errorMessage").fadeIn();
            return;
        }
        $.ajax({
            type: "POST",
            cache: false,
            data: {
                username: $("#username").val()
            },
            url: "/teachers/isUser",
            dataType: "json",
            success: function(res) {
                if (res.status && res.status == 200) {
                    $("#greeting, #instruction").hide();
                    $("#greeting").html("Hi, " + res.teacher.name + ".")
                    $("#instruction").html("Please enter your password below.")
                    $("#greeting, #instruction").fadeIn();
                    $("#submitUsername").hide();
                    $("#submitPassword").fadeIn();
                    $("#username").hide();
                    $("#password").fadeIn();
                    $("#errorMessage").fadeOut();
                    $("#password").focus();
                } else {
                    $("#errorMessage").fadeOut();
                    $("#errorMessage").html("Teacher not found.<br>Please check with the school administration.")
                    $("#errorMessage").fadeIn();
                }
            },
            error: function(xhr, textStatus, thrownError) {
                $("#errorMessage").html("Something went wrong.<br>Please check with the school administration.")
                $("#errorMessage").fadeIn();
            }
        });
    });
    
    $("#submitPassword").click(function() {
        if (!$("#password").val()) {
            $("#errorMessage").fadeOut();
            $("#errorMessage").html("Please enter a password");
            $("#errorMessage").fadeIn();
            return;
        }
        $.ajax({
            type: "POST",
            cache: false,
            data: {
                username: $("#username").val(),
                password: $("#password").val()
            },
            url: "/teachers/requestLogin",
            dataType: "json",
            success: function(res) {
                $("#errorMessage").fadeOut();
                $("#errorMessage").html(res.message);
                $("#errorMessage").fadeIn();
                if (res.status == 200) {
                    $("#errorMessage").css("color", "#00b511")
                    window.location.href = "/teachers/overview";
                }
            },
            error: function(xhr, textStatus, thrownError) {
                $("#errorMessage").fadeOut();
                $("#errorMessage").html("Oops. Something went wrong.")
                $("#errorMessage").fadeIn();
            }
        });
    });

    $("#username, #password").on("keypress", function(event) {
        if (event.charCode == 13) {
            if (event.currentTarget.id == "username")
                $("#submitUsername").click();
            else
                $("#submitPassword").click();
        }
    });
});
