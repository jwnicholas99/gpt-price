// Define addUpdatePrice
function addUpdatePrice(fn){
    return function(event){
        fn(event);
        updatePrice()
    }
}

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
  radio.addEventListener('click', addUpdatePrice(handleModelRadioClick));
});

isTraining.addEventListener('click', addUpdatePrice(handleModelRadioClick));

// Link max length text input with max length range input
const maxLenInput = document.getElementById('maxLenInput');
const maxLenRange = document.getElementById('maxLenRange');

function handleMaxLenInputChange(event){
    maxLenRange.value = event.target.value;
}

function handleMaxLenRangeChange(event){
    maxLenInput.value = event.target.value;
}

maxLenInput.addEventListener('input', addUpdatePrice(handleMaxLenInputChange));
maxLenRange.addEventListener('input', addUpdatePrice(handleMaxLenRangeChange));

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

modelInput.addEventListener('input', addUpdatePrice(handleModelInputChange))

// Calculates number of characters, number of tokens and price
const textInput = document.getElementById('textInput');
const numChars = document.getElementById('numChars');
const numTokens = document.getElementById('numTokens');

function handleTextInputChange(event){
    const inputLen = event.target.value.length
    numChars.innerHTML = inputLen;
    numTokens.innerHTML = inputLen / 4;
}

textInput.addEventListener('input', addUpdatePrice(handleTextInputChange))

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
    minPrice.innerHTML = calcPrice(numTokens.innerHTML, pricingDict[modelInput.value])
    maxPrice.innerHTML = calcPrice(maxLenInput.value, pricingDict[modelInput.value])
}