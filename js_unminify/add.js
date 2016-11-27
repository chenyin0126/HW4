$(".forms").addClass("mdl-shadow--2dp animated fadeInDown");
$("#ck-button").children().addClass("mdl-shadow--2dp");
$("#daily-button").children().not('span').addClass("mdl-shadow--2dp");
$(".icon").addClass("mdl-shadow--2dp");
$("#save").addClass("mdl-shadow--2dp");

Parse.initialize("fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW", "p6LeZCW3qLA6OcH0Pkfhz714pAsZOdZFJd33aLpl");
Parse.User.current().fetch();
var currentUser = Parse.User.current();
currentUser.fetch().then(function (fetchedUser) {
    var name = fetchedUser.getUsername();
});
var redCross = ' <span style="color: #F44336">&#10006;</span>';
var err_p = document.createElement("P");
err_p.style.textAlign = "center";
err_p.style.color = "#333";
err_p.id = "err_p";

var bool_showError = false;

var days = {
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false
};

var times;

var img = {
    name: "",
    url: "",
    __type: "File"
};

var default_img;

//save data for check weekly frequency
$(document).ready(function () {
    $("#ck-button label input").change(function (e) {
        days[this.value] = this.checked;
    });
});

//save data for daily frequency
$(document).ready(function () {
    $("#daily-button label input").change(function (e) {
        $('#others').val('');
        times = this.value;
    });
});


$(document).ready(function () {
    $("#others").keyup(function () {
        $('#r1').attr('checked', false);
        $('#r2').attr('checked', false);
        $('#r3').attr('checked', false)
    });

    $("#others").change(function () {
        $('#r1').attr('checked', false);
        $('#r2').attr('checked', false);
        $('#r3').attr('checked', false)
    });
});

//img upload
$("#icon4").click(function () {
    $("#uploader").trigger("click");
});

$("#uploader").change(function () {
    var filelist = $("#uploader").prop("files");
    if (filelist.length > 0) {
        var filename = filelist[0].name;
        var filetype = filelist[0].type;

        $.ajax({
            url: "https://api.parse.com/1/files/"+filename,
            type: 'POST',
            headers: {
                'X-Parse-Application-Id': 'fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW',
                'X-Parse-REST-API-Key': 'O0AtJZe9VdbGnwBmSFb41yIRB2J6rKiXqa5kOI56'
            },
            dataType: 'JSON',
            contentType: filetype,
            processData:false,
            data: filelist[0],
            success: function (data, status, xhr) {
                $("#icon4").attr("src", data.url);
                selectImage('icon4');
                img.name = data.name;
                img.url = data.url;
                analyticsUploadImage();
            },
            error: function (xhr, status, error) {
                alert("error upload image");
                Rollbar.error("Error Upload Image:", xhr.responseText);
            }
        });
    }
});

function onClickAdd() {

    checkInputs(function (title, other) {
        // Parse Creating Habit Data

        var formData = {
            userId: Parse.User.current().id,
            title: title,
            days: days,
            times: times,
            other: other,
            img: img,
            default_img: default_img
        };

        $.ajax({
            url: "https://api.parse.com/1/classes/Habits",
            type: 'POST',
            dataType: 'JSON',
            contentType: "application/json",
            headers: {
                'X-Parse-Application-Id': 'fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW',
                'X-Parse-REST-API-Key': 'O0AtJZe9VdbGnwBmSFb41yIRB2J6rKiXqa5kOI56'
            },
            data: JSON.stringify(formData),
            success: function (data, status, xhr) {
                analyticsAddHabit();
                createNotify(Parse.User.current().id, data.objectId);
            },
            error: function (xhr, status, error) {
                alert("Error Save " + xhr.responseText);
                Rollbar.error("Error Save New Habit:", xhr.responseText);
            }
        });
    });
}

function checkInputs(callback) {
    var title = document.getElementById("title").value;
    var other = document.getElementById("others").value;
    if (!title) {
        showError("Habit title missing!");
    }
    else if (typeof $('.icon').attr("style") === "undefined") {
        showError("Icon missing!");
    }
    else if (!(days.sunday || days.monday || days.tuesday || days.wednesday || days.thursday || days.friday || days.saturday)) {
        showError("Weekly frequency missing!");
    } else if (!times) {
        showError("Daily frequency missing!");
    } else {
        if (bool_showError)
            document.getElementById("form").removeChild(err_p);
        callback(title, other);
    }
}

function showError(message) {
    bool_showError = true;
    err_p.innerHTML = message + redCross;
    document.getElementById("form").appendChild(err_p);
}

function createNotify(userid, habitid) {
    var formData = {
        userId: userid,
        habitId: habitid,
        todayCount: 0,
        daysInRow: 0,
        best: 0
    };

    $.ajax({
        url: "https://api.parse.com/1/classes/Notifications",
        type: 'POST',
        dataType: 'JSON',
        contentType: "application/json",
        headers: {
            'X-Parse-Application-Id': 'fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW',
            'X-Parse-REST-API-Key': 'O0AtJZe9VdbGnwBmSFb41yIRB2J6rKiXqa5kOI56'
        },
        data: JSON.stringify(formData),
        success: function (data, status, xhr) {
            alert("Success Save");
            analyticsAddNotification();
            window.location.href = "../src/list.min.html";
        },
        error: function (xhr, status, error) {
            alert("Error Save " + xhr.responseText);
            Rollbar.error("Error Save New Habit:", xhr.responseText);
        }
    });
}

function analyticsAddHabit(){
    var dimensions = {};
    Parse.Analytics.track('Add Habit', dimensions);
}

function analyticsAddNotification(){
    var dimensions = {};
    Parse.Analytics.track('Add Notification', dimensions);
}

function analyticsUploadImage(){
    var dimensions = {};
    Parse.Analytics.track('Uploaded Image', dimensions);
}

function selectImage(name) {
    //Clear all the other effects
    document.getElementById('icon1').style.border = "none";
    document.getElementById('icon2').style.border = "none";
    document.getElementById('icon3').style.border = "none";
    document.getElementById('icon4').style.border = "none";
    var image = document.getElementById(name);
    image.style.border = "5px solid #42A5F5";
    if (name != 'icon4') {
        default_img = "../img/" + name + ".jpg";
    }
    else {
        default_img = undefined;
    }
}

