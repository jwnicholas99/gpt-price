// Define addUpdatePrice
function addUpdatePriceAndTooLong(fn){
    return function(event){
        fn(event);
        updatePrice();
        checkTooLong();
    }
}

function handleCloseBtnClick(){
    window.close();
}

const closeBtn = document.getElementById('closeBtn');
closeBtn.addEventListener('click', handleCloseBtnClick);

// Link isFineTune radio btns with isTraining toggle switch
const isTraining = document.getElementById('isTraining');

function handleModelRadioClick() {
  if (document.getElementById('fineTunedModel').checked) {
    isTraining.style.display = 'block';
  } else {
    isTraining.style.display = 'none';
  }
}

const radioBtns = document.querySelectorAll('input[name="isFineTune"]');
radioBtns.forEach(radio => {
  radio.addEventListener('click', addUpdatePriceAndTooLong(handleModelRadioClick));
});

isTraining.addEventListener('click', addUpdatePriceAndTooLong(handleModelRadioClick));

// Link max length text input with max length range input
const maxLenInput = document.getElementById('maxLenInput');
const maxLenRange = document.getElementById('maxLenRange');

function handleMaxLenInputChange(event){
    maxLenInput.value = Math.min(Math.max(event.target.value, 1), maxLenRange.max);
    maxLenRange.value = maxLenInput.value;
}

function handleMaxLenRangeChange(event){
    maxLenInput.value = event.target.value;
}

maxLenInput.addEventListener('input', addUpdatePriceAndTooLong(handleMaxLenInputChange));
maxLenRange.addEventListener('input', addUpdatePriceAndTooLong(handleMaxLenRangeChange));

// Link model to max length range
const modelInput = document.getElementById('modelInput');

function handleModelInputChange(event){
    if(event.target.value == "davinci"){
        maxLenRange.max = 4000;
    } else {
        maxLenRange.max = 2048;
    }
    maxLenInput.value = maxLenRange.value;
}

modelInput.addEventListener('input', addUpdatePriceAndTooLong(handleModelInputChange))

// Calculates number of characters, number of tokens and price
const textInput = document.getElementById('textInput');
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

textInput.addEventListener('input', addUpdatePriceAndTooLong(handleTextInputChange))

const clearBtn = document.getElementById('clearBtn');

function handleClearBtnClick() {
    textInput.value = "";
    numChars.innerHTML = 0;
    numTokens.innerHTML = 0;
    tooLong.style.display = "none";
}

clearBtn.addEventListener('click', addUpdatePriceAndTooLong(handleClearBtnClick))

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
        if(document.getElementById('switch').checked){
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