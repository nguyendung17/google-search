const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const sizeOf = require('image-size');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để phân tích JSON
app.use(express.json());

// Hàm để kiểm tra kích thước hình ảnh
async function getImageSize(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const image = Buffer.from(response.data, 'binary');
        return sizeOf(image);
    } catch (error) {
        return null; // Nếu có lỗi, trả về null
    }
}

// API để tìm kiếm hình ảnh
app.get('/api/images', async (req, res) => {
    const { query } = req;
    if (!query.text) {
        return res.status(400).json({ error: 'Missing search text' });
    }

    const keywords = encodeURIComponent(query.text);
    const imageUrls = [];

    try {
        const { data } = await axios.get(`https://www.google.com/search?hl=vi&tbm=isch&q=${keywords}`);
        const $ = cheerio.load(data);
        
        // Lưu trữ hứa hẹn kiểm tra kích thước hình ảnh
        const promises = [];

        $('img').each((index, element) => {
            const imageUrl = $(element).attr('src');
            const originalUrl = $(element).parent('a').attr('href'); // Lấy link gốc từ thẻ <a>
            if (imageUrl && originalUrl) {
                promises.push(
                    getImageSize(imageUrl).then(size => {
                        if (size && size.width >= 10 && size.height >= 10) {
                            imageUrls.push({
                                imageUrl: imageUrl,
                                originalUrl: originalUrl // Thêm link gốc vào kết quả
                            });
                        }
                    })
                );
            }
        });

        // Chờ tất cả các yêu cầu kiểm tra kích thước hoàn tất
        await Promise.all(promises);

        // Trả về tối đa 20 URL hình ảnh
        return res.json(imageUrls.slice(0, 20));
    } catch (error) {
        console.error('Error fetching images:', error);
        return res.status(500).json({ error: 'Error fetching images' });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
