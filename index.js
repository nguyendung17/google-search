const axios = require('axios');
const cheerio = require('cheerio');

async function fetchGoogleImages(text) {
    const keywords = encodeURIComponent(text); // Mã hóa từ khóa

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
        return imageUrls.slice(0, 5);
    } catch (error) {
        console.error('Error fetching images:', error);
        return [];
    }
}

// Ví dụ sử dụng
fetchGoogleImages("Mô tả về một cảnh đẹp thiên nhiên").then(images => {
    console.log(images);
});
