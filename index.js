import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/', async (req, res, next) => {
    console.log("Scraping...");
    res.json(await get("https://www.instagram.com/nklas.io/"));
});

export async function get(html) {
    var pictures = [];
    await axios.get(html).then(result => {
        const $ = cheerio.load(result.data);
        const data = $('script[type="text/javascript"]').get(3).children[0].data.substring(21).slice(0, -1);
        const { entry_data: jsonData } = JSON.parse(data);
        const edges = { count: jsonData.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.count, data: jsonData.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges };

        console.log(`Scrapped  ${edges.count} images`);

        edges.data.forEach(element => {
            pictures.push({ timestamp: element.node.taken_at_timestamp, display_url: element.node.display_url, thumbnail_src: element.node.thumbnail_src });
        });
    });

    return pictures;
}


app.listen(2093, () => {
    console.log(`App running on port http://localhost:2093`);
});