function convertYuanToCustomCurrency(currencyValue) {
    return new Promise((resolve, reject) => {

        //get the users selected currency from local storage. if no currency is selected, default to USD
        chrome.storage.local.get(['currency'], (result) => {
            const selectedCurrency = result.currency || 'USD'; 
            //set the exchange rate based on the selected currency
            let exchangeRate = 6.36523266; // default to USD exchange rate
            if (selectedCurrency === 'EUR') {
                exchangeRate = 7.01160542;
            } else if (selectedCurrency === 'GBP') {
                exchangeRate = 8.02434975;
            }

            const convertedValue = currencyValue / exchangeRate;

            // format the converted value as a currency string in the selected currency
            const formattedValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: selectedCurrency,
            }).format(convertedValue);
            resolve(formattedValue);
        });
    });
}

function replaceYuanWithCustomCurrency() {

    // array of class names that can contain item values on a yupoo page
    const classNames = ['.text_overflow.album__title', '.album3__title', '.showalbumheader__gallerytitle', '.album4__title'];

    // array of regex patterns to match different formats of Yuan values on the page
    const regexPatterns = [
        /(\d+)?\s*([￥¥])\s*(\.\s*)?~?\s*([\d,]+(\.\d+)?)/g, // matches "￥890", "￥ 890", "890 ￥" and similar
        /(\d+)([￥¥])/g, // matches only "190¥" because previous regex bugged
        /P\s*[:：]?\s*(\d+)/gi, // matches "P890", "P: 896" and similar
        /Price\D*(\d+)\s*(?:Yuan|CNY|RMB)?/gi, // matches "Price:379", "Price：249Yuan", "price: 258CNY" and similar
        /(\d+)\s*(?:Yuan|CNY|RMB)/g, // matches "238CNY", "CNY250", "CNY 330", "【430RMB】" and similar
    ];

    //find all elements that contain item values
    const findElements = () => {
        // loop through the classNames array to find all elements with the given class names
        for (let i = 0; i < classNames.length; i++) {
            const elements = document.querySelectorAll(classNames[i]);
            if (elements.length > 0) {
                return elements;
            }
        }
        return [];
    };

    // replaces Yuan values with custom currency values for a given element and regex pattern
    const replaceYuanValue = (element, pattern) => {
        // find all matches of the regex pattern in the element's inner text
        const matches = element.innerText.match(pattern);
        if (!matches) return;

        // loop through each match found in the element
        matches.forEach(match => {
            // remove everything from the string except for the number
            const value = match.replace(/[^\d.,-]/g, '');
            if (!value) return;

            // convert the Yuan value to a custom currency value
            convertYuanToCustomCurrency(parseFloat(value))
                .then(formattedValue => {
                    // replaces the Yuan value in the element's text with the custom currency value
                    const newText = element.innerText.replace(match, formattedValue);
                    element.innerText = newText;
                })
                .catch(error => {
                    console.error(error);
                });
        });
    };

    // find all elements
    const elements = findElements();
    // loop through each element and replace Yuan values with custom currency values using the regex patterns
    elements.forEach(element => {
        regexPatterns.forEach(pattern => replaceYuanValue(element, pattern));
    });
}

//runs main function
replaceYuanWithCustomCurrency(); 


//delays the desired executed function
function debounce(func, wait) { 
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

// listens for changes to the DOM (like scrolling and elements not being loaded instantly) and runs the function again, uses debounce function for performance reasons and to not be called multiple times for no reason
const observer = new MutationObserver(debounce(replaceYuanWithCustomCurrency, 500)); 
observer.observe(document, { 
    subtree: true,
    childList: true
});