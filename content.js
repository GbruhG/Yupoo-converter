
function convertYuanToCustomCurrency(currencyValue) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['currency'], (result) => {
            const selectedCurrency = result.currency || 'USD'; // default to '$' if no currency is selected
            const exchangeRateUSD = 6.86755431;
            const exchangeRateEUR = 7.58513932;
            const exchangeRateGBP = 8.60403863;
            let convertedValue;

            if (selectedCurrency === 'USD') {
                convertedValue = currencyValue / exchangeRateUSD;
            } else if (selectedCurrency === 'EUR') {
                convertedValue = currencyValue / exchangeRateEUR;
            } else if (selectedCurrency === 'GBP') {
                convertedValue = currencyValue / exchangeRateGBP;
            } else {
                convertedValue = currencyValue; // no conversion needed
            }

            const formattedValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: selectedCurrency,
            }).format(convertedValue);
            resolve(formattedValue);
        });
    });
}

function replaceYuanWithCustomCurrency() {
    let elements = document.querySelectorAll(".text_overflow.album__title");

    if (elements.length === 0) { //check if empty because there can be different classes
        elements = document.querySelectorAll(".album3__title");
    }
    if(elements.length === 0){ //check if empty because there can be different classes
        elements = document.querySelectorAll(".showalbumheader__gallerytitle");
    }
    
    const regex = /(\d+)?\s*([￥¥])\s*(\.\s*)?~?\s*([\d,]+(\.\d+)?)/g;
    
    elements.forEach(element => {
        const match = element.innerText.match(regex);
        if (match) {
            match.forEach(m => {
                const value = m.replace(/\s/g, '').replace(/(￥|¥|¥\.~|¥\.\s~|¥\s~|￥|￥\.~|￥\.\s~|￥\s~|\¥|[,.~])/g, '').match(/\d+(\.\d+)?/);
                if (value) {
                    convertYuanToCustomCurrency(parseFloat(value[0]))
                        .then(formattedValue => {
                            const newText = element.innerText.replace(m, formattedValue);
                            element.innerText = newText;
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }
            });
        }
    });
}



replaceYuanWithCustomCurrency();