let cropper;
let croppedImages = [];
let editedImage = null;
let beautifiedImage = null;

document.getElementById('upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('image');
            img.src = e.target.result;
            document.getElementById('crop-container').style.display = 'block';

            if (cropper) cropper.destroy();
            cropper = new Cropper(img, {
                aspectRatio: 3.5 / 4.5,
                viewMode: 1,
                autoCropArea: 1,
                cropBoxResizable: true,
                cropBoxMovable: true,
            });
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('crop-button').addEventListener('click', function() {
    if (croppedImages.length >= 3) {
        alert('Crop limit reached. Please delete an existing cropped image to continue.');
        return;
    }

    const canvas = cropper.getCroppedCanvas({
        width: 3.5 * 300 / 2.54,
        height: 4.5 * 300 / 2.54,
    });

    const croppedImage = canvas.toDataURL('image/jpeg');
    const croppedImgElement = document.createElement('img');
    croppedImgElement.src = croppedImage;
    croppedImgElement.className = 'cropped-image';

    const croppedImageContainer = document.createElement('div');
    croppedImageContainer.className = 'cropped-image-container';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    const useButton = document.createElement('button');
    useButton.textContent = 'Use this';
    useButton.addEventListener('click', function() {
        document.body.innerHTML = '';
        const selectedImage = document.createElement('img');
        selectedImage.src = croppedImage;
        selectedImage.className = 'selected-image';
        document.body.appendChild(selectedImage);

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'actions-container';

        const beautifyButton = document.createElement('button');
        beautifyButton.textContent = 'Beautify';
        beautifyButton.addEventListener('click', function() {
            selectedImage.style.filter = 'brightness(1.05) contrast(1.1) saturate(1.1)';
            selectedImage.style.border = '2px solid black';
            beautifiedImage = selectedImage.src;

            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'slider-container';

            const sliderLabel = document.createElement('label');
            sliderLabel.textContent = 'Adjust Beautify:';

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '0';
            slider.max = '100';
            slider.value = '50';

            slider.addEventListener('input', function() {
                const value = slider.value / 100;
                selectedImage.style.filter = `brightness(${1 + value * 0.05}) contrast(${1 + value * 0.1}) saturate(${1 + value * 0.1})`;
                beautifiedImage = selectedImage.src;
            });

            sliderContainer.appendChild(sliderLabel);
            sliderContainer.appendChild(slider);
            document.body.appendChild(sliderContainer);
        });

        const addBorderButton = document.createElement('button');
        addBorderButton.textContent = 'Add Border';
        addBorderButton.addEventListener('click', function() {
            const existingSliderContainer = document.querySelector('.slider-container');
            if (existingSliderContainer) existingSliderContainer.remove();

            const colorOptionsContainer = document.createElement('div');
            colorOptionsContainer.className = 'color-options-container';

            ['red', 'green', 'blue'].forEach(color => {
                const colorButton = document.createElement('button');
                colorButton.textContent = color;
                colorButton.style.backgroundColor = color;
                colorButton.addEventListener('click', function() {
                    selectedImage.style.border = `2px solid ${color}`;
                    beautifiedImage = selectedImage.src;
                });
                colorOptionsContainer.appendChild(colorButton);
            });

            document.body.appendChild(colorOptionsContainer);
        });

        const removeBackgroundButton = document.createElement('button');
        removeBackgroundButton.textContent = 'Remove Background';
        removeBackgroundButton.addEventListener('click', function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = selectedImage.naturalWidth;
            canvas.height = selectedImage.naturalHeight;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const img = new Image();
            img.src = selectedImage.src;
            img.onload = function() {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                selectedImage.src = canvas.toDataURL('image/jpeg');
                beautifiedImage = selectedImage.src;
            };
        });

        const continueButton = document.createElement('button');
        continueButton.textContent = 'Continue';
        continueButton.style.padding = '15px 30px';
        continueButton.style.fontSize = '16px';
        continueButton.addEventListener('click', function() {
            editedImage = beautifiedImage || selectedImage.src;

            document.body.innerHTML = `
                <h1>Choose Paper Type</h1>
                <div class="button-container">
                    <button id="paper-4x6">4x6</button>
                    <button id="paper-a4">A4</button>
                </div>
                <div id="number-of-copies-container" class="button-container" style="display:none;">
                    <h2>Number of Copies</h2>
                    <div id="number-of-copies-buttons"></div>
                </div>
            `;

            document.getElementById('paper-4x6').addEventListener('click', function() {
                displayNumberOfCopiesOptions('4x6');
            });

            document.getElementById('paper-a4').addEventListener('click', function() {
                displayNumberOfCopiesOptions('A4');
            });
        });

        actionsContainer.appendChild(beautifyButton);
        actionsContainer.appendChild(addBorderButton);
        actionsContainer.appendChild(removeBackgroundButton);
        actionsContainer.appendChild(continueButton);
        document.body.appendChild(actionsContainer);
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function() {
        croppedImageContainer.remove();
        croppedImages = croppedImages.filter(img => img !== croppedImgElement);
    });

    buttonContainer.appendChild(useButton);
    buttonContainer.appendChild(deleteButton);
    croppedImageContainer.appendChild(croppedImgElement);
    croppedImageContainer.appendChild(buttonContainer);
    document.getElementById('preview-container').appendChild(croppedImageContainer);

    croppedImages.push(croppedImgElement);
});

function displayNumberOfCopiesOptions(paperType) {
    const numberOfCopiesContainer = document.getElementById('number-of-copies-container');
    const numberOfCopiesButtons = document.getElementById('number-of-copies-buttons');
    numberOfCopiesButtons.innerHTML = '';

    let maxCopies = paperType === 'A4' ? 42 : 12;
    for (let i = 6; i <= maxCopies; i += 6) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', function() {
            arrangeImages(paperType, i);
        });
        numberOfCopiesButtons.appendChild(button);
    }

    numberOfCopiesContainer.style.display = 'block';
}

function arrangeImages(paperType, numberOfCopies) {
    document.body.innerHTML = `
        <div class="container">
            ${Array(42).fill('<div class="box"></div>').join('')}
        </div>
        <div class="button-container">
            <button id="back-button">Back</button>
            <button id="print-button">Print</button>
            <button id="download-button">Download PDF</button>
        </div>
    `;

    const boxes = document.querySelectorAll('.box');
    for (let i = 0; i < numberOfCopies; i++) {
        const img = document.createElement('img');
        img.src = editedImage;
        img.className = 'arranged-image';
        boxes[i].appendChild(img);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        .container {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 1.5px;
            width: 100%;
            height: 100%;
            margin: 0;
        }
        .box {
            width: 127px;
            height: 151.1px;
            border: 1px solid white;
            box-sizing: border-box;
            background-color: white;
        }
        .arranged-image {
            width: 100%;
            height: 100%;
            border: 2px solid black; /* Ensure the border is applied here */
            box-sizing: border-box; /* Include the border in the element's dimensions */
        }
        @media print {
            @page {
                size: A4;
                margin: 1;
            }
            header, footer, .no-print {
                display: none;
            }
            * {
                transform: scale(1);
                transform-origin: 0 0;
            }
            .empty {
                display: none;
            }
            .container, .content {
                page-break-before: avoid;
                page-break-after: avoid;
            }
        }
    `;
    document.head.appendChild(style);

    document.getElementById('back-button').addEventListener('click', function() {
        location.reload();
    });

    document.getElementById('print-button').addEventListener('click', function() {
        window.print();
    });

    document.getElementById('download-button').addEventListener('click', function() {
    const container = document.querySelector('.container');
    html2canvas(container, {useCORS: true}).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'JPEG', 0, 0);
        pdf.save('a4-layout.pdf');
    }).catch(error => {
        console.error('Error generating PDF:', error);
    });
});
}
