import Website, { WebsiteCategories } from "../models/website.model.js";
import PostScarapperService from "../service/scraper/postScraper.js"; // ✅ import ScrapingBee client

class PostAgentModel {
  async postAgent() {
    // Get enabled websites with POST category
    const enabledWebsites = await Website.findAll({
      where: { category: WebsiteCategories.POST},
      attributes: ["url", "scrapingConfig"],
      raw: true,
    });

    // Setup ScrapingBee client
    const allPosts = [];

    for (const site of enabledWebsites) {
      const posts = await PostScarapperService.postScraper(site.url, site.scrapingConfig);
      allPosts.push(...posts);
    }

    return allPosts;
  }
}

export default new PostAgentModel();
