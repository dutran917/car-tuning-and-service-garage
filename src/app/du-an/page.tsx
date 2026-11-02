import { Breadcrumb, ProjectGallery, CTA } from "@/components/Sections";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Thư viện các bản độ hoàn thiện tại Quốc Dương Auto", "Khám phá các dự án nâng cấp xe thực tế đã thi công và bàn giao tại xưởng Quốc Dương Auto.", "/du-an");
export default function ProjectsPage() {
  return (
    <>
      <div className="container page-wrap">
        <Breadcrumb items={[{ label: "Thư viện bản độ" }]} />
        <header className="page-intro">
          <div className="eyebrow"><span className="eyebrow-line" />BUILD LIBRARY</div>
          <h1>Các bản độ thực tế<br /><span>tại Quốc Dương Auto.</span></h1>
          <p>Mỗi chiếc xe rời xưởng là một tác phẩm được cá nhân hóa hoàn chỉnh — từ phong cách ngoại thất khí động học, mâm lốp thể thao đến không gian nội thất da Nappa sang trọng.</p>
          <div className="disclosure">Hình ảnh thực tế 100% được chụp trực tiếp tại xưởng thi công Quốc Dương Auto. Cấu hình và chi phí thực tế được điều chỉnh linh hoạt theo từng yêu cầu riêng của chủ xe.</div>
        </header>
        <ProjectGallery />
      </div>
      <CTA />
    </>
  );
}
