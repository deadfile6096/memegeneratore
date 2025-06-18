// --- Get references to all HTML elements ---
const createRandomBtn = document.getElementById('createRandomBtn');
const downloadBtn = document.getElementById('downloadBtn');
const organizeBtn = document.getElementById('organizeBtn');
const canvas = document.getElementById('memeCanvas');
const placeholder = document.getElementById('placeholder');
const ctx = canvas.getContext('2d');

const welcomePopupOverlay = document.getElementById('welcomePopupOverlay');
const acknowledgeBtn = document.getElementById('acknowledgeBtn');
const howItWorksBtn = document.getElementById('howItWorksBtn'); // NEW

const tokenAddressSpan = document.getElementById('tokenAddress');
const copyBtn = document.getElementById('copyBtn');

const uploadInput1 = document.getElementById('uploadInput1');
const uploadInput2 = document.getElementById('uploadInput2');
const thumb1 = document.getElementById('thumb1');
const thumb2 = document.getElementById('thumb2');
const createCustomBtn = document.getElementById('createCustomBtn');

const submissionArea = document.getElementById('submissionArea');
const imageIdDisplay = document.getElementById('imageIdDisplay');
const publicKeyInput = document.getElementById('publicKeyInput');
const submitKeyBtn = document.getElementById('submitKeyBtn');
const keyInputGroup = document.querySelector('.key-input-group');

const sideNotification = document.getElementById('sideNotification');
const closeNotificationBtn = document.getElementById('closeNotificationBtn');

// --- State variables to hold data ---
let uploadedImage1 = null;
let uploadedImage2 = null;
let currentImageId = null;

// --- Audio Elements ---
const actionSound = document.getElementById('actionSound');
const clickSound = document.getElementById('clickSound');

// --- Helper function to play a sound ---
function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

// --- Popup Logic ---
acknowledgeBtn.addEventListener('click', () => {
    playSound(clickSound);
    welcomePopupOverlay.classList.add('hidden');
});

// NEW: Event listener for "How it Works" button to reopen the popup
howItWorksBtn.addEventListener('click', () => {
    playSound(clickSound);
    welcomePopupOverlay.classList.remove('hidden');
});


// --- Clipboard Logic ---
const copyAddress = async () => {
    playSound(clickSound);
    try {
        await navigator.clipboard.writeText(tokenAddressSpan.innerText);
        copyBtn.innerText = "COPIED!";
        setTimeout(() => { copyBtn.innerText = "[ ]"; }, 1500);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy address!');
    }
};

// --- Custom Upload Logic ---
function handleFileUpload(event, slot) {
    playSound(clickSound);
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const fileData = { image: img, name: file.name, size: file.size };
            if (slot === 1) {
                uploadedImage1 = fileData;
                thumb1.src = e.target.result;
                thumb1.parentElement.classList.add('has-image');
            } else {
                uploadedImage2 = fileData;
                thumb2.src = e.target.result;
                thumb2.parentElement.classList.add('has-image');
            }
            checkIfReadyToGenerate();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function checkIfReadyToGenerate() {
    if (uploadedImage1 && uploadedImage2 && (uploadedImage1.name !== uploadedImage2.name || uploadedImage1.size !== uploadedImage2.size)) {
        createCustomBtn.disabled = false;
    } else {
        createCustomBtn.disabled = true;
    }
}

function generateCustomMeme() {
    if (createCustomBtn.disabled) return;
    playSound(actionSound);
    
    placeholder.style.display = 'none';
    canvas.style.display = 'block';
    submissionArea.style.display = 'none';
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const halfWidth = canvas.width / 2;
    
    ctx.drawImage(uploadedImage1.image, 0, 0, uploadedImage1.image.width / 2, uploadedImage1.image.height, 0, 0, halfWidth, canvas.height);
    ctx.drawImage(uploadedImage2.image, uploadedImage2.image.width / 2, 0, uploadedImage2.image.width / 2, uploadedImage2.image.height, halfWidth, 0, halfWidth, canvas.height);
    
    showSubmissionAreaWithDelay();
}

// --- Random Meme Generation Logic ---
const memeImageSources = [
    'images/meme1.jpg', 'images/meme2.png', 'images/meme3.png', 'images/meme4.png', 'images/meme5.png', 'images/meme7.png', 'images/meme8.png', 'images/meme9.png', 'images/meme10.png', 'images/meme11.jpg', 'images/meme12.png', 'images/meme13.png', 'images/meme14.png', 'images/meme15.png', 'images/meme16.png', 'images/meme17.png', 'images/meme18.png', 'images/meme19.jpg', 'images/meme20.jpg', 'images/meme21.jpg', 'images/meme22.jpg', 'images/meme23.png', 'images/meme24.jpg',
];

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(`Could not load image at ${url}`);
        img.src = url;
    });
}

async function generateRandomMeme() {
    playSound(actionSound);
    placeholder.style.display = 'block';
    placeholder.innerHTML = '<p>GENERATING...</p>';
    canvas.style.display = 'none';
    submissionArea.style.display = 'none';
    
    let index1 = Math.floor(Math.random() * memeImageSources.length);
    let index2;
    do { index2 = Math.floor(Math.random() * memeImageSources.length); } while (memeImageSources.length > 1 && index1 === index2);

    try {
        const [img1, img2] = await Promise.all([loadImage(memeImageSources[index1]), loadImage(memeImageSources[index2])]);
        placeholder.style.display = 'none';
        canvas.style.display = 'block';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const halfWidth = canvas.width / 2;
        ctx.drawImage(img1, 0, 0, img1.width / 2, img1.height, 0, 0, halfWidth, canvas.height);
        ctx.drawImage(img2, img2.width / 2, 0, img2.width / 2, img2.height, halfWidth, 0, halfWidth, canvas.height);
        showSubmissionAreaWithDelay();
    } catch (error) {
        console.error(error);
        placeholder.innerHTML = `<p>ERROR: COULD NOT LOAD IMAGES. CHECK FILE PATHS.</p>`;
        placeholder.style.color = '#d92c2c';
    }
}

// --- Submission Area Logic ---
function generateImageId() { return Math.floor(100000 + Math.random() * 900000).toString(); }
function resetSubmissionForm() { publicKeyInput.disabled = false; publicKeyInput.value = ''; submitKeyBtn.disabled = false; submitKeyBtn.textContent = 'SUBMIT'; }

function showSubmissionAreaWithDelay() {
    submissionArea.style.display = 'flex';
    imageIdDisplay.textContent = 'GENERATING';
    imageIdDisplay.classList.add('generating');
    keyInputGroup.style.visibility = 'hidden';

    sideNotification.classList.remove('show');
    organizeBtn.classList.remove('glowing-button');

    setTimeout(() => {
        imageIdDisplay.classList.remove('generating');
        currentImageId = generateImageId();
        imageIdDisplay.textContent = `UNIQUE IMAGE ID: ${currentImageId}`;
        resetSubmissionForm();
        keyInputGroup.style.visibility = 'visible';

        sideNotification.classList.add('show');
        organizeBtn.classList.add('glowing-button');

    }, 1000);
}

function isValidSolanaKey(key) { return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(key); }

function submitPublicKey() {
    playSound(clickSound);
    const key = publicKeyInput.value.trim();

    if (key === '' || !isValidSolanaKey(key)) {
        alert(key === '' ? 'Please enter a public key.' : 'Invalid Solana Public Key!');
        publicKeyInput.classList.add('shake');
        setTimeout(() => { publicKeyInput.classList.remove('shake'); }, 500);
        return;
    }
    
    playSound(actionSound);
    publicKeyInput.disabled = true;
    submitKeyBtn.disabled = true;
    submitKeyBtn.textContent = 'SUBMITTED!';

    console.log('--- SUBMISSION DATA ---');
    console.log('Image ID:', currentImageId);
    console.log('Public Key:', key);
}

// --- Download Logic ---
function downloadMeme() {
    if (canvas.style.display === 'none') { alert('Please create a meme first!'); return; }
    const link = document.createElement('a');
    link.download = `meme-${currentImageId || 'custom'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// --- Add Event Listeners to ALL interactive elements ---
createRandomBtn.addEventListener('click', generateRandomMeme);
createCustomBtn.addEventListener('click', generateCustomMeme);
downloadBtn.addEventListener('click', () => { playSound(clickSound); downloadMeme(); });
organizeBtn.addEventListener('click', () => { playSound(clickSound); });
uploadInput1.addEventListener('change', (e) => handleFileUpload(e, 1));
uploadInput2.addEventListener('change', (e) => handleFileUpload(e, 2));
submitKeyBtn.addEventListener('click', submitPublicKey);
document.querySelector('.token-address-wrapper').addEventListener('click', copyAddress);

closeNotificationBtn.addEventListener('click', () => {
    playSound(clickSound);
    sideNotification.classList.remove('show');
    organizeBtn.classList.remove('glowing-button'); 
});