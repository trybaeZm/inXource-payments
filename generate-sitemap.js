const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');

const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/pricing', changefreq: 'weekly', priority: 0.8 },
];

const generateSitemap = async () => {
  const sitemap = new SitemapStream({ hostname: 'https://yourwebsite.com/' });

  links.forEach(link => sitemap.write(link));

  sitemap.end();

  const sitemapXML = await streamToPromise(sitemap).then(data => data.toString());

  fs.writeFileSync('public/sitemap.xml', sitemapXML);
  console.log('Sitemap generated successfully.');
};

generateSitemap();
