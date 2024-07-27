
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log('message', message)
    if (message.action === 'fromContent') {
        chrome.notifications.create({
            type: "basic",
            title: message.title,
            message: message.message,
            iconUrl: "../icons/ym128x128.png"
        });
    } else if (message.action === "downloadAllImages") {
        // 下载所有图片
        const images = message.images;
        const totalImages = images.length;
        for (let i = 0; i < totalImages; i++) {
            const imageUrl = images[i];
            // 获取合法的文件名
            const originalFilename = imageUrl.split('/').pop().split('?')[0].trim();
            const extension = originalFilename.split('.').pop();
            const index = totalImages - i; 
            const filename = `image_${index}.${extension}`;
            chrome.downloads.download({
                url: imageUrl,
                filename: `xiaomi_images_download/${filename}`,
                conflictAction: 'uniquify',
                saveAs: false
            });
        }
    }
});