function shadowing() {
    $("#habit-list").children().addClass("mdl-shadow--2dp");
    $(".habit-icon").addClass("mdl-shadow--2dp");
}

$("#addHabit").addClass("mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect");

$("h1").addClass("animated fadeInDown");

var btn = $('<button/>').attr({
    class: "mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect",
    id: "settingsButton",
    style: "color: rgb(33, 72, 100)"
});
btn.html("Settings");
var div = $('<div/>').attr({id: "settingButtonDiv"});
div.css("text-align", "center");
div.html(btn);
$("body").append(div);

$("#settingsButton").click(function (e) {
    window.location.href = "../src/settings.min.html";
}).addClass("animated fadeInUp");


Parse.initialize("fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW", "p6LeZCW3qLA6OcH0Pkfhz714pAsZOdZFJd33aLpl");
Parse.User.current().fetch();
var currentUserId = Parse.User.current().id;

var g_notificationData;

function onClickDone(element) {
    var msgElement = (element.parentNode.parentNode.getElementsByClassName("message"))[0];
    msgElement.style.visibility = "visible";

    var habitid = element.id.split('-')[2];

    var formData = {
        todayCount: findNotificationbyId(habitid, g_notificationData).todayCount + 1
    };

    $.ajax({
        url: "https://api.parse.com/1/classes/Notifications/" + findNotificationbyId(habitid, g_notificationData).objectId,
        type: 'PUT',
        dataType: 'JSON',
        contentType: "application/json",
        headers: {
            'X-Parse-Application-Id': 'fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW',
            'X-Parse-REST-API-Key': 'O0AtJZe9VdbGnwBmSFb41yIRB2J6rKiXqa5kOI56'
        },
        data: JSON.stringify(formData),
        success: function (data, status, xhr) {
            findNotificationbyId(habitid, g_notificationData).todayCount += 1;
            $("#today-" + habitid).html(findNotificationbyId(habitid, g_notificationData).todayCount);
            analyticsHabitDone();
        },
        error: function (xhr, status, error) {
            alert("Error Update");
            Rollbar.error("Error Update:", xhr.responseText);
        }
    });
}

function onClickDelete(element) {
    var habitid = element.id.split('-')[2];
    var result = confirm("Want to delete?");
    if (result) {
        $.ajax({
            url: "https://api.parse.com/1/classes/Habits/" + habitid,
            type: 'DELETE',
            dataType: 'JSON',
            contentType: "application/json",
            headers: {
                'X-Parse-Application-Id': 'fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW',
                'X-Parse-REST-API-Key': 'O0AtJZe9VdbGnwBmSFb41yIRB2J6rKiXqa5kOI56'
            },
            success: function (data, status, xhr) {
                deleteNotification(habitid, g_notificationData);
                alert("success delete");
                analyticsHabitDelete();
                var child = element.parentNode.parentNode;
                var parent = child.parentNode;
                $(child).addClass('animated fadeOutRight');
                setTimeout(
                    function () {
                        parent.removeChild(child);
                    }, 500);
            },
            error: function (xhr, status, error) {
                alert("Error Delete");
                Rollbar.error("Error Delete:", xhr.responseText);
            }
        });
    }
}

function onClickEdit(element) {
    analyticsHabitEdit();
    window.location.href = "../src/edit.min.html?id=" + element.id.replace('op-edit-', '');
}


function onRowReady(id, title, imgURL, times, todayCount, days, best) {
    console.log(id);
    var progress = parseInt(days) / parseInt(best) * 100;
    var template = $("#template").clone();

    // li
    template.attr("id", id);

    template.find(".snooze").attr("id", "snooze-" + id);
    template.find(".ignore").attr("id", "ignore-" + id);
    template.find(".goSetting").attr("id", "goSetting-" + id);


    // habit-info
    template.find(".habit-name").html(title);
    template.find(".habit-icon").attr("src", imgURL);
    template.find("#days").html(days);
    template.find("#best").html(best);

    // dynamic progress bar
    var progressBar = document.createElement('div');
    progressBar.id = "progress-" + id;
    progressBar.className = 'mdl-progress mdl-js-progress';
    progressBar.addEventListener('mdl-componentupgraded', function () {
        this.MaterialProgress.setProgress(progress);
    });
    componentHandler.upgradeElement(progressBar);
    template.find('.message-total').append(progressBar);

    // message-today
    template.find("#today").attr("id", "today-" + id).html(todayCount);
    template.find("#times").attr("id", "times-" + id).html(times);
    // buttons
    template.find(".op-done").attr("id", "op-done-" + id);
    template.find(".op-edit").attr("id", "op-edit-" + id);
    template.find(".op-del").attr("id", "op-del-" + id);
    //componentHandler.upgradeElement(document.getElementById("#menu-button-"+id));

    template.appendTo("#habit-list");


    var menu = document.createElement("div");
    menu.className = "menu";
    menu.innerHTML = '<button id="menu-button-' + id + '"' + 'class="mdl-button mdl-js-button mdl-button--icon" style="float: right; color: #888;">' +
    '<i class="material-icons">more_vert</i>' +
    '</button>' +
    '<ul class="mdl-menu mdl-menu&#45;&#45;bottom-right mdl-js-menu mdl-js-ripple-effect" for="menu-button-' + id + '"' + '>' +
    '<li class="mdl-menu__item snooze" id="snooze-' + id + '">Snooze for 15 minutes</li>' +
    '<li class="mdl-menu__item ignore" id="ignore-' + id + '">Ignore</li>' +
    '<li class="mdl-menu__item goSetting" id="goSetting">Go To Settings</li>' +
    '</ul>';


    var ee = document.getElementById(id);
    ee.insertBefore(menu, ee.firstChild);
    componentHandler.upgradeAllRegistered();
}

/****************************************************
 * Notification
 ***************************************************/

function addMenuListeners() {
    $(".snooze").on("click", function () {
        var id = $(this).attr('id').replace('snooze-', '');
        alert('snooze ' + id);
    });

    $(".ignore").on("click", function () {
        var id = $(this).attr('id').replace('ignore-', '');
        alert('ignore ' + id);
    });

    $(".goSetting").on("click", function () {
        // alert('goSetting');
    });
}

/****************************************************
 * Pull Data from db
 ***************************************************/

function getParseData() {

    var constraints = {
        "userId": currentUserId
    };

    var constraints_url = encodeURIComponent(JSON.stringify(constraints));

    $.ajax({
        url: "https://api.parse.com/1/classes/Habits?where=" + constraints_url,
        type: 'GET',
        dataType: 'JSON',
        contentType: "application/json",
        headers: {
            'X-Parse-Application-Id': 'fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW',
            'X-Parse-REST-API-Key': 'O0AtJZe9VdbGnwBmSFb41yIRB2J6rKiXqa5kOI56'
        },
        success: function (data, status, xhr) {
            getNotificationData(currentUserId, function (notificationData) {
                g_notificationData = notificationData;
                processJSONData(data, notificationData);
            });
        },
        error: function (xhr, status, error) {
            alert("Error Get Parse Data");
            Rollbar.error("Error Get Parse Data:", xhr.responseText);
        }
    });
}


function processJSONData(data, notificationData) {

    $.each(data.results, function (index, value) {
        var todayCount = $.map(notificationData, function (n) {
            if (n.habitId === value.objectId)
                return n.todayCount;
        });

        var daysInRow = $.map(notificationData, function (n) {
            if (n.habitId === value.objectId)
                return n.daysInRow;
        });

        var best = $.map(notificationData, function (n) {
            if (n.habitId === value.objectId)
                return n.best;
        });

        if (typeof value.default_img === "undefined")
            onRowReady(value.objectId, value.title, value.img.url, value.times, todayCount, daysInRow, best);
        else
            onRowReady(value.objectId, value.title, value.default_img, value.times, todayCount, daysInRow, best);

    });

    shadowing();
    addMenuListeners();


    //show notification for the least updated habit
    if (data.results && notificationData) {
        var first = notificationData[0];
        var habit = $.map(data.results, function (n) {
            if (n.objectId === first.habitId)
                return n;
        });
        habit = habit[0];
        notifyMe("Review " + habit.title, "You haven't done yet, click to view", habit.objectId,
            function (e) {
                window.location.hash = '#' + e.target.tag;
                $('#menu-button-' + e.target.tag).trigger('click');
            },
            function (e) {

            }
        );
    } else {
        notifyMe("Add Your First Habit!", "You don't have a habit yet, click to add", "new",
            function (e) {
                $("#addHabit").trigger('click');
            },
            function (e) {

            }
        );
    }
}

function findNotificationbyId(habitid, notificationData) {
    for (i = 0; i < notificationData.length; i++) {
        if (notificationData[i].habitId === habitid)
            return notificationData[i];
    }
}

function findNotificationbyId2(habitid, notificationData) {
    for (i = 0; i < notificationData.length; i++) {
        if (notificationData[i].habitId === habitid)
            return i;
    }
}

function deleteNotification(habitid, notificationData) {
    $.ajax({
        url: "https://api.parse.com/1/classes/Notifications/" + findNotificationbyId(habitid, notificationData).objectId,
        type: 'DELETE',
        dataType: 'JSON',
        contentType: "application/json",
        headers: {
            'X-Parse-Application-Id': 'fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW',
            'X-Parse-REST-API-Key': 'O0AtJZe9VdbGnwBmSFb41yIRB2J6rKiXqa5kOI56'
        },
        success: function (data, status, xhr) {
            notificationData.splice(findNotificationbyId2(habitid, notificationData), 1);
        },
        error: function (xhr, status, error) {
            Rollbar.error("Error Delete Notification:", xhr.responseText);
        }
    });
}

function analyticsHabitDone() {
    var dimensions = {};
    Parse.Analytics.track('Habit Done', dimensions);
}

function analyticsHabitDelete() {
    var dimensions = {};
    Parse.Analytics.track('Habit Delete', dimensions);
}

function analyticsHabitEdit() {
    var dimensions = {};
    Parse.Analytics.track('Habit Edit', dimensions);
}
