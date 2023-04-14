const currencies = document.querySelectorAll('#currencies input[type="radio"]');
const convertBtn = document.querySelector('#convertBtn');

convertBtn.addEventListener('click', saveCurrency);

function getCurrency() { //get currently selected currency
    var selectedCurrency = document.querySelector('input[name="currency"]:checked').value;
    return selectedCurrency;
}

function saveCurrency() { //saves the users currency choice to chromes memory
    var selectedCurrency = getCurrency();
    chrome.storage.sync.set({
        currency: selectedCurrency
    }, function () { 
        console.log('Currency saved: ' + selectedCurrency);
        chrome.tabs.reload();
    });
}


chrome.storage.sync.get(['currency'], function (result) { // display the users previous currency choice from chromes memory
    if (result.currency) {
        var currencyInput = document.querySelector(`input[value="${result.currency}"]`);
        currencyInput.checked = true;
    }
});