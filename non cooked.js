function replaceYuanWithCustomCurrency() {
    const elements = document.querySelectorAll(".text_overflow.album__title");
    const regex = /(\d+\s*)?(￥|\￥\.~|\￥\.\s)(\s*[\d\.~]+\s*)?/g;



  
    elements.forEach((element) => {
      const match = element.innerText.match(regex);
        console.log(match)
      if (match) {
        match.forEach((m) => {
          const value = m
            .replace(/\s/g, "")
            .replace(/(￥|\￥\.~|[.~])/g, "")
            .match(/~?\d+(\.\d+)?/);
  
          if (value) {
            console.log(
              `Element ${element.id} contains a variation of the currency symbol with the number ${value[0]}.`
            );
  
            convertYuanToCustomCurrency(value[0])
              .then((formattedValue) => {
                const newText = element.innerText.replace(m, formattedValue);
                element.innerText = newText;
              })
              .catch((error) => {
                console.error(error);
              });
          }
        });
      }
    });
  }
  