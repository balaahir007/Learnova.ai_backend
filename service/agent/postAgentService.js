import PostScarapperService from "../scraper/postScraper.js";
class PostAgentService {
  async postAgent(data) {
    const postContents = [];
    // for(const item of data){
    //     const response = await PostScrapperService.scrapeWithPlaywright(item.url, item.scrapingConfig || {});
    //     postContents.push(response);
    // }
const devToConfig = {
  titleSelector: ".ltag__link__content > h2",
  contentSelector: ".crayons-story__indention-billboard .text-styles--billboard",
  dateSelector: ".ltag__link__content > h3",
  imageSelector: ".crayons-story__indention-billboard img" // all images in post content
};


    const devPost = await PostScrapperService.scrapeWithPlaywright(
      "https://dev.to/latest",
    );
    postContents.push(devPost);
    for (const content of postContents) {
      console.log("Scraped Post Content:", content);
    }
    return postContents;
  }
}

export default new PostAgentService();
