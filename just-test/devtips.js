const puppeteer = require("puppeteer");

(async () => {

  // Extract recette on the page, recursively check the next page in the URL pattern
  const extractrecette = async url => {
    
    // Scrape the data we want
    const page = await browser.newPage();
    await page.goto(url);
    const recetteOnPage = await page.evaluate(() =>
      Array.from(document.querySelectorAll("div.compact")).map(compact => ({
        title: compact.querySelector("h3.title").innerText.trim(),
        logo: compact.querySelector(".logo img").src
      }))
    );
    await page.close();

    // Recursively scrape the next page
    if (recetteOnPage.length < 1) {
      // Terminate if no recette exist
      return recetteOnPage
    } else {
      // Go fetch the next page ?page=X+1
      
      const nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
     
      const nextUrl = `https://marketingplatform.google.com/about/recette/find-a-partner?page=${nextPageNumber}`;
console.log("==================="+nextPageNumber)
      return recetteOnPage.concat(await extractrecette(nextUrl))
     
    }
  };

  const browser = await puppeteer.launch();
  const firstUrl =
    "https://marketingplatform.google.com/about/recette/find-a-partner?page=1";
  const recette = await extractrecette(firstUrl);

  // Todo: Update database with recette
  console.log(recette);

  await browser.close();
})();