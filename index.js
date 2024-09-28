const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để phân tích JSON
app.use(express.json());

// API để tìm kiếm hình ảnh
app.get('/api/images', async (req, res) => {
    const { query } = req;
    if (!query.text) {
        return res.status(400).json({ error: 'Missing search text' });
    }

    const keywords = encodeURIComponent(query.text);

    try {
        const { data } = await axios.get(`https://www.google.com/search?hl=vi&tbm=isch&q=${keywords}`);
        const $ = cheerio.load(data);
        const imageUrls = [];

        $('img').each((index, element) => {
            const imageUrl = $(element).attr('src');
            if (imageUrl) {
                imageUrls.push(imageUrl);
            }
        });

        // Lọc và trả về 5 URL hình ảnh đầu tiên
        return res.json(imageUrls.slice(0, 5));
    } catch (error) {
        console.error('Error fetching images:', error);
        return res.status(500).json({ error: 'Error fetching images' });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
