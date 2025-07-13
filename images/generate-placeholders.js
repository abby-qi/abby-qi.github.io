// 使用Node.js的Canvas库生成图片占位符
// 需要安装：npm install canvas
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 创建目录（如果不存在）
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// 生成图片占位符
function generatePlaceholder(width, height, text, outputPath) {
  // 创建画布
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 设置背景色
  ctx.fillStyle = '#3498db';
  ctx.fillRect(0, 0, width, height);

  // 添加文本
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  // 保存图片
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(outputPath, buffer);
  console.log(`生成图片: ${outputPath}`);
}

// 确保目录存在
ensureDirectoryExists(path.join(__dirname, 'posts'));

// 生成主页图片
generatePlaceholder(1200, 630, '技术博客', path.join(__dirname, 'og-image.jpg'));
generatePlaceholder(1200, 630, '技术博客', path.join(__dirname, 'twitter-image.jpg'));

// 生成归档页图片
generatePlaceholder(1200, 630, '文章归档', path.join(__dirname, 'archive-og.jpg'));
generatePlaceholder(1200, 630, '文章归档', path.join(__dirname, 'archive-twitter.jpg'));

// 生成关于页图片
generatePlaceholder(1200, 630, '关于我', path.join(__dirname, 'about-og.jpg'));
generatePlaceholder(1200, 630, '关于我', path.join(__dirname, 'about-twitter.jpg'));

// 生成文章图片
generatePlaceholder(1200, 630, 'Hello World', path.join(__dirname, 'posts', 'hello-world.jpg'));

console.log('所有图片占位符已生成完成！');