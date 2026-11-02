import { Breadcrumb, CTA } from "@/components/Sections";
import { PackageCatalog } from "@/components/PackageCatalog";
import { pageMetadata } from "@/lib/seo";
import { getManagedPackages } from "@/lib/managed-content";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata("Gợi ý gói nâng cấp ô tô & VinFast", "Tham khảo các hướng cấu hình nâng cấp ô tô VinFast VF3, VF7, VF8, MPV7 và các dòng xe khác theo phong cách và ngân sách.", "/goi-do");
export default async function PackagesPage() { const packages = await getManagedPackages(); return <div className="page-wrap"><div className="container"><Breadcrumb items={[{label:"Gói nâng cấp"}]}/><header className="page-intro"><div className="eyebrow"><span className="eyebrow-line"/>PERSONAL BUILDS & PACKAGES</div><h1>Gợi ý cấu hình<br/><span>cho từng dòng xe.</span></h1><p>Các gói nâng cấp dưới đây từ VinFast (VF3, VF7, VF8, MPV7) đến các dòng xe khác là điểm khởi đầu cho cuộc tư vấn. Hạng mục, phụ kiện và chi phí được tinh chỉnh linh hoạt theo nhu cầu và đời xe thực tế của bạn.</p><div className="disclosure">Mức ngân sách tham khảo: khoảng 30–200+ triệu đồng. Báo giá chi tiết được xác nhận sau khi khảo sát đời xe và thống nhất phạm vi thi công.</div></header><PackageCatalog packages={packages}/><section className="page-note"><h2>Điều gì ảnh hưởng đến chi phí?</h2><p>Dòng xe, phiên bản, lựa chọn phụ kiện, chất liệu và phạm vi thi công. Hãy gửi các hạng mục bạn quan tâm để nhận phương án cấu hình tối ưu.</p></section></div><CTA/></div>; }
