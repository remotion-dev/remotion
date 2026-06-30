import { Composition, registerRoot } from "remotion";
import React from "react";

// Định nghĩa cấu trúc dữ liệu từ file lesson.json để Type-safe
interface Scene {
  id: string;
  text: string;
  durationInSeconds: number;
}

interface LessonProps {
  lessonTitle: string;
  scenes: Scene[];
}

// Component hiển thị nội dung chính của Video
const MainVideo: React.FC<LessonProps> = ({ lessonTitle, scenes }) => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#000000",
        color: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        fontSize: 40,
        fontFamily: "Helvetica, Arial, sans-serif",
        padding: 40,
        textAlign: "center",
      }}
    >
      <h1>{lessonTitle}</h1>
      <p style={{ fontSize: 24, color: "#aaaaaa" }}>
        [Hệ thống hiển thị tự động - Đã nạp thành công {scenes?.length || 0} scenes]
      </p>
    </div>
  );
};

// Cấu hình Thượng tầng hệ thống Remotion
export const RemotionRoot: React.FC = () => {
  const FPS = 30; // Cấu hình 30fps tối ưu tài nguyên máy ảo render năm 2026

  return (
    <>
      <Composition
        id="MyComposition" // ID phải khớp chính xác với lệnh gọi trong package.json
        component={MainVideo}
        fps={FPS}
        width={1920}  // Độ phân giải Ngang chuẩn bài giảng (Đổi thành 1080 nếu làm Shorts)
        height={1080} // Độ phân giải Dọc chuẩn bài giảng (Đổi thành 1920 nếu làm Shorts)
        
        // Khối logic dynamic frame: Tự động tính độ dài video dựa trên tổng durationInSeconds của JSON
        calculateMetadata={async ({ props }) => {
          const inputProps = props as LessonProps;
          
          // Tính tổng số giây của tất cả các scene cộng lại
          const totalSeconds = inputProps?.scenes?.reduce(
            (acc, scene) => acc + (scene.durationInSeconds || 0), 
            0
          ) || 10; // Mặc định 10 giây nếu data lỗi
          
          return {
            durationInFrames: Math.floor(totalSeconds * FPS), // Chuyển đổi giây sang số Frames thực tế
            props: inputProps, // Chuyển tiếp dữ liệu sạch vào Component hiển thị
          };
        }}

        // Data dự phòng khi chạy dev mode không truyền tham số props
        defaultProps={{
          lessonTitle: "Giới thiệu về Remotion",
          scenes: [
            {
              id: "default_scene",
              text: "Hệ thống đang đợi file cấu hình lesson.json...",
              durationInSeconds: 5,
            },
          ],
        }}
      />
    </>
  );
};

// Đăng ký Root component với Remotion Engine để CLI tìm thấy điểm khởi chạy
registerRoot(RemotionRoot);
