import scrapingbee from "scrapingbee";
import * as cheerio from 'cheerio';
class PostScarapperService {
  constructor() {
    this.scraper = null;
  }
  async initScraper() {
    if (!this.scraper) {
      this.scraper = new scrapingbee.ScrapingBeeClient(
        "GZ0WAGIAJIRNSODW7EKBMLYVEP9D3HVTA0KK55I1Y018V0PNZEH6T9VS7YHY35ZDQ7IQCPZCOQB0Y413"
      );
    }
  }

  async postScraper(url, config = {}) {
    try {
      await this.initScraper();
      const response = await this.scraper.get({
        url,
        params: { render_js: "true" },
      });

      const html = new TextDecoder().decode(response.data);
      const $ = cheerio.load(html);

      const posts = [];
      $(config.postContainer || "article").each((i, el) => {
        const title = $(el).find(config.titleSelector).text().trim();
        const content = $(el).find(config.contentSelector).text().trim();
        const image = $(el).find(config.imageSelector).attr("src");
        const date =
          $(el).find(config.dateSelector).attr("datetime") ||
          $(el).find(config.dateSelector).text().trim();

        posts.push({ title, content, image, date });
      });
      console.log(`Scraped ${posts.length} posts from ${url}`);
      for (const post of posts) {
        console.log(`- ${post.title} (${post.date}) , Image: ${post.image} , Content Snippet: ${post.content.substring(0, 500)}...`);
      }

      return posts;
    } catch (error) {
      console.error(`Playwright scraping failed for ${url}:`, error);
      throw error;
    }
  }
}

export default new PostScarapperService();
