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
    wednesday: true,
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

getParseData(getQueryVariable('id'));

//save data for check weekly frequency
$(document).ready(function () {
    $("#ck-button label input").change(function (e) {
        days[this.value] = this.checked;
        //alert(this.value + this.checked);
    });
});

//save data for daily frequency
$(document).ready(function () {
    $("#daily-button label input").change(function (e) {
        $('#others').val('');
        times = this.value;
        //alert(this.value + this.checked);
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
                $("#icon4").unbind("click");
                $("#icon4").attr("src", data.url);
                $("#icon4").attr("onclick", "selectImage('icon4');");
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
        icon.style.border = "5px solid #42A5F5";
    }
}
function checkInputs(callback) {
    var title = document.getElementById("title").value;
    if (!title) {
        showError("Habit title missing!");
    }
    else {
        callback(title)
    }
}

function showError(message) {
    bool_showError = true;
    err_p.innerHTML = message + redCross;
    document.getElementById("form").appendChild(err_p);
}

function OnClickSave(){

    checkInputs(function (title) {

        var formData = {
            title: document.getElementById("title").value,
            days: days,
            times: times,
            other: document.getElementById("others").value,
            img: img,
            default_img: default_img
        };

        $.ajax({
            url: "https://api.parse.com/1/classes/Habits/" + getQueryVariable('id'),
            type: 'PUT',
            dataType: 'JSON',
            contentType: "application/json",
            headers: {
                'X-Parse-Application-Id': 'fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW',
                'X-Parse-REST-API-Key': 'O0AtJZe9VdbGnwBmSFb41yIRB2J6rKiXqa5kOI56'
            },
            data: JSON.stringify(formData),
            success: function (data, status, xhr) {
                alert("Success Update");
                analyticsEditHabit();
                window.location.href = "../src/list.min.html";
            },
            error: function (xhr, status, error) {
                alert("error update");
                Rollbar.error("Error Update:", xhr.responseText);
            }
        });
    });
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
}

function getParseData(id) {
    $.ajax({
        url: "https://api.parse.com/1/classes/Habits/" + id,
        type: 'GET',
        dataType: 'JSON',
        contentType: "application/json",
        headers: {
            'X-Parse-Application-Id': 'fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW',
            'X-Parse-REST-API-Key': 'O0AtJZe9VdbGnwBmSFb41yIRB2J6rKiXqa5kOI56'
        },
        success: function (data, status, xhr) {
            setupData(data);
        },
        error: function (xhr, status, error) {
            alert("Error Get Parse Data");
            Rollbar.error("Error Get Parse Data:", xhr.responseText);
        }
    });
}


function setupData(data) {
    //title
    $("#title").val(data.title);
    //icon
    if (data.img.name) {
        selectImage('icon4');
        $("#icon4").attr("src", data.img.url);
    }
    else {
        selectImage(data.default_img.split('.')[2].split('/')[2]);
    }
    //Weekly
    $("#ck-button input").each(function () {
        if (data.days[this.value]) {
            this.setAttribute("checked", "checked");
        }
    });
    //Daily
    $("#daily-button input").each(function () {
        var number = data.times;
        var other = data.other;
        if (other === null || other === '') {
            switch (number) {
                case "1" :
                    if (this.value == "1") {
                        this.setAttribute("checked", "checked");
                    }
                    break;

                case "2" :
                    if (this.value == "2") {
                        this.setAttribute("checked", "checked");
                    }
                    break;
                case "3" :
                    if (this.value == "3") {
                        this.setAttribute("checked", "checked");
                    }
                    break;

                default:
                    break;
            }
        } else {
            $("#others").val(other);
        }
    });
}

function analyticsEditHabit(){
    var dimensions = {};
    Parse.Analytics.track('Edit Habit', dimensions);
}

function analyticsUploadImage(){
    var dimensions = {};
    Parse.Analytics.track('Uploaded Image', dimensions);
}