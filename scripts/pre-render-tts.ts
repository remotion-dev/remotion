import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs';
import path from 'path';
import mp3Duration from 'mp3-duration';

// Load lesson data
const lessonPath = path.resolve('./data/lesson.json');
const lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));

const publicDir = path.resolve('./public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Lựa chọn giọng tiếng Việt của Edge TTS
// Hoài My (Nữ) - vi-VN-HoaiMyNeural
// Nam Minh (Nam) - vi-VN-NamMinhNeural
const tts = new EdgeTTS({
  voice: 'vi-VN-NamMinhNeural', // Jules đẹp trai thì chọn giọng Nam Minh nhé!
});

async function generateTTS() {
  console.log('Bắt đầu sinh âm thanh TTS cho các scene...');

  const updatedScenes = [];

  for (let i = 0; i < lessonData.scenes.length; i++) {
    const scene = lessonData.scenes[i];
    const outputPath = path.join(publicDir, `${scene.id}.mp3`);

    console.log(`Đang xử lý scene ${scene.id}: "${scene.text}"`);

    // Gọi API TTS
    await tts.ttsPromise(scene.text, outputPath);

    // Đo đạc độ dài thực tế của audio
    const durationInSeconds = await mp3Duration(outputPath);

    // Lưu thông tin vào file JSON, thêm 0.5 giây padding cho tự nhiên
    scene.durationInSeconds = durationInSeconds + 0.5;
    scene.audioUrl = `/${scene.id}.mp3`; // Static file từ public/

    updatedScenes.push(scene);
    console.log(`✓ Đã lưu ${outputPath} (Thời lượng: ${scene.durationInSeconds.toFixed(2)}s)`);
  }

  // Ghi đè lại data json
  lessonData.scenes = updatedScenes;
  fs.writeFileSync(lessonPath, JSON.stringify(lessonData, null, 2));

  console.log('Sinh âm thanh hoàn tất! Sẵn sàng render.');
}

generateTTS().catch(console.error);
