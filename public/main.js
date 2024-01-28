const button = document.getElementById("submit");
const object = {};

// USER CLICKED ON CREATE POSTER
button.addEventListener("click", async (event) => {
    background(200);
    console.log("Making poster...");
    document.getElementById("before_making_poster").style.display = "none";
    document.getElementById("making_poster").style.display = "inline-block";
    const keyword_1 = document.getElementById("keyword_1").value;
    const keyword_2 = document.getElementById("keyword_2").value;
    //console.log(keyword_1 + keyword_2);
    const options_quote = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword_1, keyword_2 }),
    }

    const response_quote = await fetch(`/keyword`, options_quote);
    let full_msg = await response_quote.json();
    full_msg = full_msg.split("Theme");
    //console.log(full_msg);
    const quote = full_msg[0].replace(/[&\/\\#+()$~%"*<>{}]/g, '').trim();
    const theme = full_msg[1].replace(/[&\/\\#+-:.()$~%"*<>{}]/g, '').trim();
    console.log(quote);
    console.log(theme);

    const options_image = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme }),
    }
    const response_image = await fetch(`/image`, options_image);
    const json = await response_image.json();
    console.log(json);

    // Image
    const nPhotos_aux = json.photos.length;
    let max = 25;
    if (nPhotos_aux != max) max = nPhotos_aux;

    const image_number = Math.floor(Math.random() * max);
    console.log('nPhotos_aux: ' + nPhotos_aux + ', image_number: ' + image_number);
    //console.log(image_number);

    const image_url = json.photos[image_number].src.original;
    const image_avg_color = json.photos[image_number].avg_color;
    const textColor = invertColor(image_avg_color);

    loadImageAfter(image_url, quote, image_avg_color);

    // Database
    object.keyword_1 = keyword_1;
    object.keyword_2 = keyword_2;
    object.quote = quote;
    object.theme = theme;
    object.image_url = image_url;
    object.image_avg_color = image_avg_color;

    document.getElementById("making_poster").style.display = "none";
});

// Save to gallery
document.getElementById("saveToGallery").addEventListener("click", () => {
    const div = document.querySelector("#canvas_p5");
    html2canvas(div).then(async canvas => {
        let image64 = canvas.toDataURL();
        object.image64 = image64;
        console.log(object);
        alert("Your poster was successfully saved to the gallery!");

        await fetch('/db', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ object }),
        });
    });

});

// p5.js //

// Variable Declaration
let img, quote, avg_color;  // Variables from retrieved text and image
let cw, ch;                 // Canvas width & height
let template = Math.floor(Math.random() * 5) + 1;     // Random template

// Variables for text
let text_align;             // Alignment of text
let text_case;              // Uppercase or lowercase
let text_style;             // Normal, bold, italic, bold italic
let font_family;            // Font family for the text
let text_size_aux = 0.04;   // Font size
let text_color;             // Color of the quote
let aux_x, aux_y, aux_w;    // Auxiliary variables for positioning the quote

function loadImageAfter(image_url, quote_src, avg_color_src) {
    img = loadImage(image_url);
    aux_quote = quote_src;
    avg_color = avg_color_src;

    document.querySelector('#color div').style.backgroundColor = avg_color;
}

function setup() {
    let canvas = createCanvas(800, 800);
    canvas.id('canvas_p5');
    canvas.parent("poster");

    cw = canvas.width;
    ch = canvas.height;

    changeTemplate(template);
}

function draw() {
    background(200);

    if (img != null) {
        // Display background image
        image(img, 0, 0, 800, 800, 0, 0, img.width, img.height, COVER);

        // Color of text
        if (text_color == -1) {
            if (avg_color != null) {
                fill(avg_color);
                stroke(invertColor(avg_color, true)); // Choses white or black
            }
            strokeWeight(text_size_aux * 50);
        } else {
            fill(int(text_color));
            noStroke();
        }

        // Text Alignment
        if (text_align == 'LEFT' || text_align == LEFT) {
            textAlign(LEFT);
            // To inform what is the active option
            document.querySelector('#left').classList.add('text_align_chosen');
        } else if (text_align == 'CENTER' || text_align == CENTER) {
            textAlign(CENTER);
            document.querySelector('#center').classList.add('text_align_chosen');
        } else if (text_align == 'RIGHT' || text_align == RIGHT) {
            textAlign(RIGHT);
            document.querySelector('#right').classList.add('text_align_chosen');
        }

        // Text Case
        if (text_case == true || text_case == 'true') {
            quote = aux_quote.toUpperCase();
            document.querySelector('#uppercase').classList.add('button_chosen');
        } else if (text_case == false || text_case == 'false') {
            quote = aux_quote;
            document.querySelector('#lowercase').classList.add('button_chosen');
        }

        // Text Style
        if (text_style == 'NORMAL' || text_style == NORMAL) {
            textStyle(NORMAL);
            document.querySelector('#normal').classList.add('button_chosen');
        } else if (text_style == 'BOLD' || text_style == BOLD) {
            textStyle(BOLD);
            document.querySelector('#bold').classList.add('button_chosen');
        } else if (text_style == 'ITALIC' || text_style == ITALIC) {
            textStyle(ITALIC);
            document.querySelector('#italic').classList.add('button_chosen');
        } else if (text_style == 'BOLDITALIC' || text_style == BOLDITALIC) {
            textStyle(BOLDITALIC);
            document.querySelector('#bolditalic').classList.add('button_chosen');
        }

        // Font Family
        if (font_family == 1) {
            textFont('Times New Roman');
        } else if (font_family == 2) {
            textFont('Arial');
        } else if (font_family == 3) {
            textFont('Courier New');
        } else if (font_family == 4) {
            textFont('Brush Script MT');
        } else if (font_family == 5) {
            textFont('Papyrus');
        }

        // Font Size
        textSize(cw * text_size_aux);

        // Show text on top of image
        text(quote, cw * aux_x * 0.1, ch * aux_y * 0.1, cw * aux_w * 0.1);
    }
}

// Get value of text alignment input
document.querySelectorAll('.text_align').forEach(item => {
    item.addEventListener('click', event => {
        text_align = item.value;
        console.log(text_align);
        removeClass('.text_align', 'text_align_chosen');
        removeClass('.template_button', 'button_chosen');
    })
});
// Get value of text case input
document.querySelectorAll('.text_case').forEach(item => {
    item.addEventListener('click', event => {
        text_case = item.value;
        console.log(text_case);
        removeClass('.text_case', 'button_chosen');
        removeClass('.template_button', 'button_chosen');
    })
});
// Get value of text style input
document.querySelectorAll('.text_style').forEach(item => {
    item.addEventListener('click', event => {
        text_style = item.value;
        console.log(text_style);
        removeClass('.text_style', 'button_chosen');
        removeClass('.template_button', 'button_chosen');
    })
});
// Get value of font input
document.querySelector('#font_family').oninput = function () {
    font_family = document.querySelector("#font_family").value;
    console.log(font_family);
    removeClass('.template_button', 'button_chosen');
};
// Get value of text size input
document.querySelector('#text_size').oninput = function () {
    text_size_aux = document.querySelector('#text_size').value;
    console.log(text_size_aux);
    removeClass('.template_button', 'button_chosen');
};
// Get value of text color input
document.querySelectorAll('.color_button').forEach(item => {
    item.addEventListener('click', event => {
        text_color = item.value;
        console.log(text_color);
        removeClass('.template_button', 'button_chosen');
    })
});
// Get value of text position and width input
document.querySelectorAll('.pos').forEach(item => {
    item.oninput = function () {
        if (item.id == 'pos_x') {
            aux_x = item.value;
            console.log(aux_x);
        } else if (item.id == 'pos_y') {
            aux_y = item.value;
            console.log(aux_y);
        } else if (item.id == 'size') {
            aux_w = item.value;
            console.log(aux_w);
        }
        removeClass('.template_button', 'button_chosen');
    }
});
// Get template chosen
document.querySelectorAll('.template_button').forEach(item => {
    item.addEventListener('click', event => {
        template = item.value;
        console.log(template);
        changeTemplate(template);
    })
});

// Funtion with hardcoded values of templates
function changeTemplate(template) {
    removeClass('.template_button', 'button_chosen');
    removeClass('.text_align', 'text_align_chosen');
    removeClass('.text_case', 'button_chosen');
    removeClass('.text_style', 'button_chosen');

    text_size_aux = 0.04;
    if (template == 1) {
        // Times New Roman
        font_family = 1;
        text_style = BOLD;
        text_case = true;
        text_align = CENTER;
        text_color = 0;
        aux_x = 1;
        aux_y = 1;
        aux_w = 8;
        document.querySelector('#template_1').classList.add('button_chosen');
    } else if (template == 2) {
        // Arial
        font_family = 2;
        text_style = BOLDITALIC;
        text_case = true;
        text_align = CENTER;
        text_color = -1;
        aux_x = 3;
        aux_y = 2;
        aux_w = 4;
        document.querySelector('#template_2').classList.add('button_chosen');
    } else if (template == 3) {
        // Courier New
        font_family = 3;
        text_style = NORMAL;
        text_case = false;
        text_align = LEFT;
        text_color = 255;
        aux_x = 1;
        aux_y = 7;
        aux_w = 8;
        document.querySelector('#template_3').classList.add('button_chosen');
    } else if (template == 4) {
        // Brush Script MT
        font_family = 4;
        text_style = NORMAL;
        text_case = false;
        text_align = CENTER;
        text_color = -1;
        aux_x = 3;
        aux_y = 6;
        aux_w = 4;
        document.querySelector('#template_4').classList.add('button_chosen');
    } else if (template == 5) {
        // Papyrus
        font_family = 5;
        text_style = NORMAL;
        text_case = false;
        text_align = LEFT;
        text_color = 0;
        aux_x = 1;
        aux_y = 5;
        aux_w = 6;
        document.querySelector('#template_5').classList.add('button_chosen');
    }
    // Update sliders to values being used
    document.querySelector('#pos_x').value = aux_x;
    document.querySelector('#pos_y').value = aux_y;
    document.querySelector('#size').value = aux_w;
    document.querySelector('#font_family').value = font_family;
    document.querySelector('#text_size').value = text_size_aux;
}

// Function to remove class from group of elements
function removeClass(object_class, class2add) {
    document.querySelectorAll(object_class).forEach(item => {
        item.classList.remove(class2add);
    });
}

// Function to invert color
function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? color('#000000')
            : color('#FFFFFF');
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}
function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}