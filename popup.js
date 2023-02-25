// Define addUpdatePrice
function addPostEvent(fn, saveData){
    return function(event){
        fn(event);
        updatePrice();
        checkTooLong();
        saveData();
    }
}

function handleCloseBtnClick(){
    window.close();
}

const closeBtn = document.getElementById('closeBtn');
closeBtn.addEventListener('click', handleCloseBtnClick);

// Persistence of form fields
// Model Type
const baseModel = document.getElementById('baseModel')
const fineTunedModel = document.getElementById('fineTunedModel')

function saveModelType() {
    chrome.storage.local.set({[baseModel.id]: baseModel.checked});
    chrome.storage.local.set({[fineTunedModel.id]: fineTunedModel.checked});
}

// isTraining 
const isTrainingSwitch = document.getElementById('isTrainingSwitch');

function saveIsTraining() {
    chrome.storage.local.set({[isTrainingSwitch.id]: isTrainingSwitch.checked});
}

// Model
const modelInput = document.getElementById('modelInput');

function saveModelInput() {
    chrome.storage.local.set({[modelInput.id]: modelInput.value});
}

// maxLenInput and maxLenRange
const maxLenInput = document.getElementById('maxLenInput');
const maxLenRange = document.getElementById('maxLenRange');

function saveMaxLen() {
    chrome.storage.local.set({[maxLenInput.id]: maxLenInput.value});
    chrome.storage.local.set({[maxLenRange.id]: maxLenRange.value});
}

// textInput
const textInput = document.getElementById('textInput');

function saveTextInput() {
    chrome.storage.local.set({[textInput.id]: textInput.value});
}

var valueKeys = [
    "modelInput", "maxLenInput", "maxLenRange", "textInput"
];

document.addEventListener("DOMContentLoaded", function() {
    // Load in model type 
    chrome.storage.local.get(["baseModel"])
        .then((data) => baseModel.checked = data["baseModel"]);
    chrome.storage.local.get(["fineTunedModel"])
        .then((data) => {
            fineTunedModel.checked = data["fineTunedModel"];
            handleModelRadioClick(); // simulate clicking model type
        })

    // Load in isTrainingSwitch
    chrome.storage.local.get(["isTrainingSwitch"])
        .then((data) => isTrainingSwitch.checked = data["isTrainingSwitch"]);

    // Load in modelInput, maxLenInput, maxLenRange and textInput
    // These are all .value
    chrome.storage.local.get(valueKeys, function(data) {
    for (let key of valueKeys) {
        let field = document.getElementById(key);
        if(key in data){
            field.value = data[key];
        }
    }

    // Update num tokens, num chars and price
    const inputLen = textInput.value.length
    const tokenCount = inputLen / 4;

    numChars.innerHTML = inputLen;
    numTokens.innerHTML = tokenCount;
    updatePrice();
  })
})

// Link isFineTune radio btns with isTraining toggle switch
function handleModelRadioClick() {
  if (document.getElementById('fineTunedModel').checked) {
    isTraining.style.display = 'block';
  } else {
    isTraining.style.display = 'none';
  }
}

const radioBtns = document.querySelectorAll('input[name="isFineTune"]');
radioBtns.forEach(radio => {
  radio.addEventListener('click', addPostEvent(handleModelRadioClick, saveModelType));
});

isTrainingSwitch.addEventListener('click', addPostEvent(handleModelRadioClick, saveIsTraining));

// Link max length text input with max length range input
function handleMaxLenInputChange(event){
    maxLenInput.value = Math.min(Math.max(event.target.value, 1), maxLenRange.max);
    maxLenRange.value = maxLenInput.value;
}

function handleMaxLenRangeChange(event){
    maxLenInput.value = event.target.value;
}

maxLenInput.addEventListener('input', addPostEvent(handleMaxLenInputChange, saveMaxLen));
maxLenRange.addEventListener('input', addPostEvent(handleMaxLenRangeChange, saveMaxLen));

// Link model to max length range
function handleModelInputChange(event){
    if(event.target.value == "davinci"){
        maxLenRange.max = 4000;
    } else {
        maxLenRange.max = 2048;
    }
    maxLenInput.value = maxLenRange.value;
}

modelInput.addEventListener('input', addPostEvent(handleModelInputChange, saveModelInput))

// Calculates number of characters, number of tokens and price
const numChars = document.getElementById('numChars');
const numTokens = document.getElementById('numTokens');
const tooLong = document.getElementById('tooLong');

function checkTooLong(){
    const tokenCount = textInput.value.length / 4;
    
    if(tokenCount > maxLenInput.value){
        tooLong.style.display = "block";
    } else {
        tooLong.style.display = "none";
    }
}

function handleTextInputChange(event){
    const inputLen = event.target.value.length
    const tokenCount = inputLen / 4;

    numChars.innerHTML = inputLen;
    numTokens.innerHTML = tokenCount;
}

textInput.addEventListener('input', addPostEvent(handleTextInputChange, saveTextInput))

const clearBtn = document.getElementById('clearBtn');

function handleClearBtnClick() {
    textInput.value = "";
    numChars.innerHTML = 0;
    numTokens.innerHTML = 0;
    tooLong.style.display = "none";
}

clearBtn.addEventListener('click', addPostEvent(handleClearBtnClick, saveTextInput))

// Calculate and change price
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');

const baseModelPricing = {
    "ada": 0.0004,
    "babbage": 0.0005,
    "curie": 0.0020,
    "davinci": 0.0200,
}

const FineTunedModelTrainingPricing = {
    "ada": 0.0004,
    "babbage": 0.0006,
    "curie": 0.0030,
    "davinci": 0.0300,
}

const FineTunedModelUsagePricing = {
    "ada": 0.0016,
    "babbage": 0.0024,
    "curie": 0.0120,
    "davinci": 0.1200,
}

function calcPrice(numTokens, pricePerToken){
    return parseFloat(((numTokens * pricePerToken) / 1000).toFixed(8))
}

function updatePrice(){
    if(document.getElementById('fineTunedModel').checked){
        if(document.getElementById('isTrainingSwitch').checked){
            var pricingDict = FineTunedModelTrainingPricing;
        } else {
            var pricingDict = FineTunedModelUsagePricing;
        }
    } else {
        var pricingDict = baseModelPricing;
    }
    maxPrice.innerHTML = calcPrice(maxLenInput.value, pricingDict[modelInput.value]);
    minPrice.innerHTML = Math.min(calcPrice(numTokens.innerHTML, pricingDict[modelInput.value]), maxPrice.innerHTML);
}

