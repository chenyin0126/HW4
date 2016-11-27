// get permission to run notifications
Notification.requestPermission();

//Notification.requestPermission();
function notifyMe(title, body, tag, onClick, onClose) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        //var notification = new Notification("Hi there!");
        spawnNotification(body, '../img/appicon.png', title, tag, onClick, onClose);
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                //var notification = new Notification("Hi there!");
                spawnNotification(body, '../img/appicon.png', title, tag, onClick, onClose);
            }
        });
    }
}

function spawnNotification(theBody, theIcon, theTitle, tag, onClick, onClose) {
    var options = {
        body: theBody,
        icon: theIcon,
        tag: tag
    };
    var n = new Notification(theTitle, options);
    n.onshow = function () {
        //default behavior is close
        setTimeout(n.close.bind(n), 15000)
    };
    n.onclose = onClose;
    n.onclick = onClick;
}

function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
}

/******************************************************************************
 * Fetch Notification table.
 *****************************************************************************/

function getNotificationData(currentUserId, callback) {
    var constraints = {
        "userId": currentUserId
    };

    var constraints_url = encodeURIComponent(JSON.stringify(constraints));


    $.ajax({
        url: "https://api.parse.com/1/classes/Notifications?where=" + constraints_url
        + "&" + "order=updatedAt",
        type: 'GET',
        dataType: 'JSON',
        contentType: "application/json",
        headers: {
            'X-Parse-Application-Id': 'fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW',
            'X-Parse-REST-API-Key': 'O0AtJZe9VdbGnwBmSFb41yIRB2J6rKiXqa5kOI56'
        },
        success: function (data, status, xhr) {
            callback(data.results);
        },
        error: function (xhr, status, error) {
            alert("Error Get Parse Data");
            Rollbar.error("Error Get Parse Data:", xhr.responseText);
        }
    });
}
