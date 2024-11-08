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

            // Initialize Cropper.js
            if (cropper) {
                cropper.destroy();
            }
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
        width: 3.5 * 300 / 2.54, // 3.5 cm to pixels
        height: 4.5 * 300 / 2.54, // 4.5 cm to pixels
    });

    // Convert the canvas to a data URL and display it
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
        // Clear the page and display the selected image
        document.body.innerHTML = '';
        const selectedImage = document.createElement('img');
        selectedImage.src = croppedImage;
        selectedImage.className = 'selected-image';
        document.body.appendChild(selectedImage);

        // Add buttons for further actions
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'actions-container';

        const beautifyButton = document.createElement('button');
        beautifyButton.textContent = 'Beautify';
        beautifyButton.addEventListener('click', function() {
            selectedImage.style.filter = 'brightness(1.05) contrast(1.1) saturate(1.1)';
            selectedImage.style.border = '2px solid black';
            beautifiedImage = selectedImage.src; // Update beautifiedImage here

            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'slider-container';

            const sliderLabel = document.createElement('label');
            sliderLabel.textContent = 'Adjust Beautify:';

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '0';
            slider.max = '100';
            slider.value = '50'; // 50% strength

            slider.addEventListener('input', function() {
                const value = slider.value / 100;
                selectedImage.style.filter = `brightness(${1 + value * 0.05}) contrast(${1 + value * 0.1}) saturate(${1 + value * 0.1})`;
                beautifiedImage = selectedImage.src; // Update beautifiedImage here
            });

            sliderContainer.appendChild(sliderLabel);
            sliderContainer.appendChild(slider);
            document.body.appendChild(sliderContainer);
        });

        const addBorderButton = document.createElement('button');
        addBorderButton.textContent = 'Add Border';
        addBorderButton.addEventListener('click', function() {
            const existingSliderContainer = document.querySelector('.slider-container');
            if (existingSliderContainer) {
                existingSliderContainer.remove();
            }

            const colorOptionsContainer = document.createElement('div');
            colorOptionsContainer.className = 'color-options-container';

            const colors = ['red', 'green', 'blue'];
            colors.forEach(color => {
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
            // Save the edited image temporarily
            editedImage = beautifiedImage || selectedImage.src;

            // Clear the page and display paper type options
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
    const container = document.createElement('div');
    container.className = 'image-grid';

    const rows = paperType === 'A4' ? Math.ceil(numberOfCopies / 6) : Math.ceil(numberOfCopies / 3);
    const cols = paperType === 'A4' ? 6 : 3;

    for (let i = 0; i < numberOfCopies; i++) {
        const img = document.createElement('img');
        img.src = editedImage;
        img.className = 'arranged-image';
        container.appendChild(img);
    }

    document.body.innerHTML = '';
    document.body.appendChild(container);

    const style = document.createElement('style');
    style.innerHTML = `
        .image-grid {
            display: grid;
            grid-template-columns: repeat(${cols}, 1fr);
            gap: 1px;
            width: ${paperType === 'A4' ? '210mm' : '152.4mm'};
            height: ${paperType === 'A4' ? '297mm' : '101.6mm'};
            margin: 0 auto;
        }
        .arranged-image {
            width: 3.5cm;
            height: 4.5cm;
        }
    `;
    document.head.appendChild(style);
}