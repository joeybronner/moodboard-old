const SVG = "http://www.w3.org/2000/svg";
const XLINK = "http://www.w3.org/1999/xlink";
const hotspot = "rgba(0,200,200,0.3)";
var r2d = 360.0 / (2.0 * Math.PI);
var gCanvas = null;
var currentTransform = null;
var gCanvasWidth = null;
var gCanvasHeight = null;
var images = [];
var links = [];
var user = "joeybronner";
var first = true;
var videos = ["https://www.youtube.com/embed/zoPvgZ1Vbmc"];
var backgroundcolor;
var db;

function doload(u) {

    // Check if Chrome or Safari browser
    if (!isBrowserSupported())
        return;

    document.getElementById('page-title-username').innerHTML = u.toUpperCase();

    /*if (first) {
        first = false;
        // Toast example
        toastr.options = {
          "debug": false,
          "positionClass": "toast-bottom-right",
          "onclick": null,
          "fadeIn": 300,
          "fadeOut": 1000,
          "timeOut": 5000,
          "extendedTimeOut": 1000
        };
        toastr.info('HEY, WELCOME TO MOODBOARD.');
    }*/

    if (u=='' || u==undefined) 
        u=user;

    images = [];
    getJSONUserFile(u);

    // Get main canvas & retrieve width/height
    gCanvas = document.getElementById("canvas");

    gCanvasWidth = gCanvas.offsetWidth;
    gCanvasHeight = gCanvas.offsetHeight;

    // Load the images in the background, and only add them once they're
    // loaded (and, presumably, cached by the broser)
    for (var k = 0; k < images.length; k++) {
        var img = new Image();

        // do some hackyness here to get the correct variables
        // to the function
        img.onload = function(k, url) {
            return function() {
                var g = addImage(url, 1.0, this);
                g.style.opacity = 1.0;
                g.vTranslate = [Math.floor((Math.random() * gCanvasWidth * 0.4) + gCanvasWidth * 0.3),
                    Math.floor((Math.random() * gCanvasHeight * 0.5) + gCanvasHeight * 0.3)
                ];

                var c = 0.25 + (Math.random() * .25);
                g.vScale = c; // 0.25; // 0.001;
                g.vRotate = (Math.random() * 40) - 20;

                g.setAttribute("transform", "translate(" + g.vTranslate[0] + "," + g.vTranslate[1] + ") " +
                    "scale(" + g.vScale + "," + g.vScale + ") " +
                    "rotate(" + g.vRotate + ") ");
                rampOpacityUp(g);
            }
        }(k, images[k]);

        img.src = images[k];
    }
/*
    for (var k = 0; k < videos.length; k++) {
                var g = addVideo(videos[k], 1.0, this);
                g.style.opacity = 1.0;
                g.vTranslate = [Math.floor((Math.random() * gCanvasWidth * 0.4) + gCanvasWidth * 0.3),
                    Math.floor((Math.random() * gCanvasHeight * 0.5) + gCanvasHeight * 0.3)
                ];

                var c = 0.25 + (Math.random() * .25);
                g.vScale = c; // 0.25; // 0.001;
                g.vRotate = (Math.random() * 40) - 20;

                g.setAttribute("transform", "translate(" + g.vTranslate[0] + "," + g.vTranslate[1] + ") " +
                    "scale(" + g.vScale + "," + g.vScale + ") " +
                    "rotate(" + g.vRotate + ") ");
                rampOpacityUp(g);
    }*/

    gCanvas.addEventListener("mousemove", onMouseMove, false);
    gCanvas.addEventListener("mouseup", onMouseUp, false);
    document.getElementById("background-rect").addEventListener("mousemove", onMouseMove, false);
    document.getElementById("background-rect").addEventListener("mouseup", onMouseUp, false);
}

function isBrowserSupported() {
    var isChromium = window.chrome;
    var vendorName = window.navigator.vendor;
    var isOpera = window.navigator.userAgent.indexOf("OPR") > -1;
    var isSafari = false;
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') != -1) {
        if (ua.indexOf('chrome') > -1) {
            // Nothing.
        } else {
            isSafari = true;
        }
    }
    if (isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false || isSafari == true) {
        return true;
    } else {
        window.location.href = 'error/notsupported.html';
    }
}

function getJSONUserFile(user) {
    $.ajax({
        url: 'data/dataset_' + user + '.json',
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var i = 0; i < data.images.length; i++) {
                images.push(data.images[i].url);
                links.push(data.images[i].link);
            }
            // Update Background color
            var object =  document.getElementById('background-rect');
            object.setAttribute("fill", data.apparences[0].backgroundcolor);
        }
    });
}

// convenience function to set X, Y, width, and height attributes
function svgSetXYWH(el, x, y, w, h) {
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("width", w);
    el.setAttribute("height", h);
}


function startTransform(ev, group, what) {
    // ignore if something else is already going on
    if (currentTransform != null)
        return;

    group.parentNode.removeChild(group);
    gCanvas.appendChild(group);

    currentTransform = {
        what: what,
        g: group,
        s: group.vScale,
        r: group.vRotate,
        t: group.vTranslate,
        x: ev.clientX,
        y: ev.clientY
    };
    rampOpacityDown(currentTransform.g);
}

// create a new clickable rect [x,y,w,h] with the givenfill/stroke
// with the given handler on mouse down
function newClickableRect(group, id, x, y, w, h, fill, stroke) {
    var p = document.createElementNS(SVG, "rect");
    p.setAttribute("id", id);
    svgSetXYWH(p, x, y, w, h);
    p.setAttribute("rx", 30);
    p.setAttribute("ry", 30);
    p.setAttribute("fill", fill);
    //p.setAttribute("stroke", stroke);
    //p.setAttribute("stroke-width", 10);
    p.addEventListener("mousedown", function(evt) {
        var g = group;
        return startTransform(evt, g, 1);
    }, false);
    return p;
}

// create all the elements for the given image URL.
// this includes the toplevel group, the image itself,
// and the clickable hotspots used for rotating the image.
var nextImageId = 0;
var nextVideoId = 0;

function addImage(url, initOpacity, img) {
    var imgw = img.width > 550 && img.height > 500 ? img.width : img.width * 2;
    var imgh = img.width > 550 && img.height > 500 ? img.height : img.height * 2;

    var id = nextImageId++;
    var s = "image" + id;
    var g = document.createElementNS(SVG, "g");
    g.setAttribute("id", s);

    if (initOpacity != null)
        g.style.opacity = initOpacity;

    var image = document.createElementNS(SVG, "image");
    image.setAttribute("id", s + "-img");
    svgSetXYWH(image, -imgw / 2, -imgh / 2, imgw, imgh);
    image.setAttribute("preserveAspectRatio", "xMinYMin slice");
    image.setAttributeNS(XLINK, "href", url);
    g.appendChild(image);

    var rect = document.createElementNS(SVG, "rect");
    rect.setAttribute("id", s + "-border");
    svgSetXYWH(rect, -imgw / 2, -imgh / 2, imgw, imgh);
    rect.setAttribute("stroke", "black");
    rect.setAttribute("rx", "10");
    rect.setAttribute("ry", "10");
    rect.setAttribute("stroke-width", "10");
    rect.setAttribute("fill", "none");

    g.appendChild(rect);

    var g2 = document.createElementNS(SVG, "g");
    g2.setAttribute("id", s + "-overlay");
    g2.setAttribute("class", "image-overlay");
    g2.setAttribute("style", "visibility: hidden");

    var rsz = 200;

    g2.appendChild(newClickableRect(g, s + "-tl", -imgw / 2, -imgh / 2, rsz, rsz, hotspot, "rgba(100,100,100,0.5)"));
    g2.appendChild(newClickableRect(g, s + "-tr", imgw / 2 - rsz, -imgh / 2, rsz, rsz, hotspot, "rgba(100,100,100,0.5)"));
    g2.appendChild(newClickableRect(g, s + "-br", imgw / 2 - rsz, imgh / 2 - rsz, rsz, rsz, hotspot, "rgba(100,100,100,0.5)"));
    g2.appendChild(newClickableRect(g, s + "-bl", -imgw / 2, imgh / 2 - rsz, rsz, rsz, hotspot, "rgba(100,100,100,0.5)"));

    g.appendChild(g2);
    g.addEventListener("mouseover", function(evt) {
        var o = g2;
        o.style.visibility = "visible";
    }, false);
    g.addEventListener("mouseout", function(evt) {
        var o = g2;
        o.style.visibility = "hidden";
    }, false);

    var clicks = 0,
        delay = 500;
    $(g).on('mousedown', function(event) {
        event.preventDefault();
        clicks++;

        setTimeout(function() {
            clicks = 0;
        }, delay);

        if (clicks === 2) {
            redirectToLink(g.id);
            clicks = 0;
            return;
        } else {
            deplace(event, g);
        }
    });

    gCanvas.appendChild(g);

    return g;
}

function addVideo(url, initOpacity, img) {
    var imgw = 560
    var imgh = 315;

    var id = nextVideoId++;
    var s = "video" + id;
    var g = document.createElementNS(SVG, "g");
    g.setAttribute("id", s);

    if (initOpacity != null)
        g.style.opacity = initOpacity;

    var foreign = document.createElementNS(SVG, "foreignObject");
    svgSetXYWH(foreign, -imgw / 2, -imgh / 2, imgw, imgh);
    g.appendChild(foreign);

    var iframe = document.createElementNS(SVG, "iframe");
    iframe.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    iframe.setAttribute("preserveAspectRatio", "xMinYMin slice");
    iframe.setAttribute("id", s + "-img");
    svgSetXYWH(iframe, -imgw / 2, -imgh / 2, imgw, imgh);
    iframe.setAttribute("src", "https://www.youtube.com/embed/BkbHeFHn8JY");
    iframe.setAttribute("frameworder", "0");
    foreign.appendChild(iframe);

    var rect = document.createElementNS(SVG, "rect");
    rect.setAttribute("id", s + "-border");
    svgSetXYWH(rect, -imgw / 2, -imgh / 2, imgw, imgh);
    rect.setAttribute("stroke", "black");
    rect.setAttribute("rx", "10");
    rect.setAttribute("ry", "10");
    rect.setAttribute("stroke-width", "10");
    rect.setAttribute("fill", "none");

    g.appendChild(rect);

    var g2 = document.createElementNS(SVG, "g");
    g2.setAttribute("id", s + "-overlay");
    g2.setAttribute("class", "image-overlay");
    g2.setAttribute("style", "visibility: hidden");

    var rsz = 200;

    g2.appendChild(newClickableRect(g, s + "-tl", -imgw / 2, -imgh / 2, rsz, rsz, hotspot, "rgba(100,100,100,0.5)"));
    g2.appendChild(newClickableRect(g, s + "-tr", imgw / 2 - rsz, -imgh / 2, rsz, rsz, hotspot, "rgba(100,100,100,0.5)"));
    g2.appendChild(newClickableRect(g, s + "-br", imgw / 2 - rsz, imgh / 2 - rsz, rsz, rsz, hotspot, "rgba(100,100,100,0.5)"));
    g2.appendChild(newClickableRect(g, s + "-bl", -imgw / 2, imgh / 2 - rsz, rsz, rsz, hotspot, "rgba(100,100,100,0.5)"));

    g.appendChild(g2);
    g.addEventListener("mouseover", function(evt) {
        var o = g2;
        o.style.visibility = "visible";
    }, false);
    g.addEventListener("mouseout", function(evt) {
        var o = g2;
        o.style.visibility = "hidden";
    }, false);

    gCanvas.appendChild(g);

    return g;
}

function redirectToLink(elementId) {
    var id = parseInt(elementId.replace("image", ""));
    var win = window.open(links[id], '_blank');
    win.focus();
}

function deplace(evt, g) {
    return startTransform(evt, g, 0);
}

function onMouseUp(ev) {
    if (currentTransform)
        rampOpacityUp(currentTransform.g);
    currentTransform = null;
}

function onMouseMove(ev) {
    if (!("currentTransform" in window) ||
        currentTransform == null)
        return;

    var ex = ev.clientX;
    var ey = ev.clientY;
    var g = currentTransform.g;
    var pos = g.vTranslate;

    if (currentTransform.what == 1) {
        var lastAngle = Math.atan2(currentTransform.y - pos[1],
            currentTransform.x - pos[0]) * r2d;
        var curAngle = Math.atan2(ey - pos[1],
            ex - pos[0]) * r2d;

        g.vRotate += (curAngle - lastAngle);

        var lastLen = Math.sqrt(Math.pow(currentTransform.y - pos[1], 2) +
            Math.pow(currentTransform.x - pos[0], 2));
        var curLen = Math.sqrt(Math.pow(ey - pos[1], 2) +
            Math.pow(ex - pos[0], 2));

        g.vScale = g.vScale * (curLen / lastLen);

    } else {
        var xd = ev.clientX - currentTransform.x;
        var yd = ev.clientY - currentTransform.y;

        g.vTranslate = [pos[0] + xd, pos[1] + yd];
    }

    currentTransform.x = ex;
    currentTransform.y = ey;

    g.setAttribute("transform", "translate(" + g.vTranslate[0] + "," + g.vTranslate[1] + ") " +
        "scale(" + g.vScale + "," + g.vScale + ") " +
        "rotate(" + g.vRotate + ") ");

}

function rampOpacityDown(g) {
    g.style.opacity = 1.0;
    var rampFunc = function() {
        var o = parseFloat(g.style.opacity) - 0.05;
        g.style.opacity = o;
        if (o > 0.7)
            setTimeout(rampFunc, 10);
    }
    rampFunc();
}

function rampOpacityUp(g) {
    g.style.opacity = 0.7;
    var rampFunc = function() {
        var o = parseFloat(g.style.opacity) + 0.05;
        g.style.opacity = o;
        if (o < 1.0)
            setTimeout(rampFunc, 10);
    }
    rampFunc();
}