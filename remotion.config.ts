import { Config } from "@remotion/cli/config";
import os from "os";

// Tối ưu Concurrency động theo số nhân CPU thực tế của node máy ảo
Config.setConcurrency(os.cpus().length);

// Bảo hiểm tính hoạt động chống crash trên container không có driver GPU Pass-through
Config.setChromiumOpenGlRenderer("swangle");

// Sử dụng định dạng ảnh JPEG để tăng tốc độ ghi đệm frame (Sửa lại chuẩn API của Remotion)
Config.setVideoImageFormat("jpeg");
