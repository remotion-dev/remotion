import {AbsoluteFill, Sequence} from "remotion";
import {useTyDoFont} from "../tydo/TyDoOverlays";
import {BilingualCaption} from "./BilingualCaption";
import {EndCard} from "./EndCard";
import {LenderRow} from "./LenderRow";
import {LowerThird} from "./LowerThird";
import {brand} from "./theme";

// A preview of the brand kit with sample text. The name, website and phone
// are placeholders to replace in a real video.
export const BrandKitDemo: React.FC = () => {
  useTyDoFont();
  return (
    <AbsoluteFill style={{background: brand.background}}>
      <Sequence durationInFrames={150} name="Lower third">
        <LowerThird name="Nguyễn Văn A" roleVi="Chuyên viên tư vấn vay" roleEn="Mortgage broker" />
      </Sequence>
      <Sequence from={20} durationInFrames={60} name="Caption 1">
        <BilingualCaption vi="Chúng tôi giúp bạn so sánh các khoản vay mua nhà" en="We help you compare home loans" />
      </Sequence>
      <Sequence from={80} durationInFrames={70} name="Lenders">
        <AbsoluteFill style={{justifyContent: "center", alignItems: "center", paddingBottom: 200}}>
          <LenderRow height={90} />
        </AbsoluteFill>
        <BilingualCaption vi="Chúng tôi làm việc với nhiều ngân hàng" en="We work with many lenders" />
      </Sequence>
      <Sequence from={150} name="End card">
        <EndCard titleVi="Liên hệ với chúng tôi" titleEn="Get in touch" website="[website]" phone="[phone]" />
      </Sequence>
    </AbsoluteFill>
  );
};
