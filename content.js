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

            const formattedValue = new Intl.NumberFormat('en-US', { //formats the value for desired currency
                style: 'currency',
                currency: selectedCurrency,
            }).format(convertedValue);
            resolve(formattedValue);
        });
    });
}

function replaceYuanWithCustomCurrency() {

    const classNames = [  '.text_overflow.album__title',  '.album3__title',  '.showalbumheader__gallerytitle',  '.album4__title',]; //there can be 4 differently named classes containing an item value on a yupoo page, none of them will exist at the same time

    let elements;
    
    for (let i = 0; i < classNames.length; i++) { //check all the elements
      elements = document.querySelectorAll(classNames[i]);
      if (elements.length > 0) {
        break;
      }
    }

    //console.log(elements);


    const regexPatterns = [
        /(\d+)?\s*([￥¥])\s*(\.\s*)?~?\s*([\d,]+(\.\d+)?)/g, //matches "￥890", "￥ 890", "890 ￥" and similar
        /P\s*[:：]?\s*(\d+)/gi, // matches "P890", "P: 896" and similar
        /Price\D*(\d+)\s*(?:Yuan|CNY|RMB)?/gi, // matches "Price:379", "Price：249Yuan", "price: 258CNY" and similar
        /(\d+)\s*(?:Yuan|CNY|RMB)/g, // matches "238CNY", "CNY250", "CNY 330", "【430RMB】" and similar
    ];

    elements.forEach(element => { //loops through all the found elements and replaces the Yuan value with the desired currency value
        console.log(element.innerText);
        regexPatterns.forEach(pattern => {
            const match = element.innerText.match(pattern);
            if (match) {
                match.forEach(m => {
                    const value = m.replace(/\s/g, '').replace(/[^\d.]/g, '');
                    if (value) {
                        convertYuanToCustomCurrency(parseFloat(value))
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
    });
}

replaceYuanWithCustomCurrency(); //runs main function




function debounce(func, wait) { //delays the desired executed function
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const observer = new MutationObserver(debounce(replaceYuanWithCustomCurrency, 500)); // listens for changes to the DOM (like scrolling and elements not being loaded instantly) and runs the function again, 
observer.observe(document, {                                                        //it uses the debounce function for performance reasons and to not be called multiple times for no reason
    subtree: true,
    childList: true
});