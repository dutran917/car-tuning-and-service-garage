import { Breadcrumb, CTA } from "@/components/Sections";
import { PackageCatalog } from "@/components/PackageCatalog";
import { pageMetadata } from "@/lib/seo";
import { getManagedPackages } from "@/lib/managed-content";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata("Gợi ý gói nâng cấp VinFast VF3", "Tham khảo các hướng cấu hình VinFast VF3 theo phong cách và ngân sách. Hạng mục, tương thích và chi phí được xác nhận riêng.", "/goi-do");
export default async function PackagesPage() { const packages = await getManagedPackages(); return <div className="page-wrap"><div className="container"><Breadcrumb items={[{label:"Gói nâng cấp"}]}/><header className="page-intro"><div className="eyebrow"><span className="eyebrow-line"/>VF3 PERSONAL BUILDS</div><h1>Gợi ý cấu hình<br/><span>cho VinFast VF3.</span></h1><p>Các hướng nâng cấp dưới đây là điểm khởi đầu cho cuộc tư vấn. Hạng mục, sản phẩm, thời gian và giá được xác nhận theo xe và nhu cầu thực tế.</p><div className="disclosure">Mức ngân sách tham khảo do chủ thương hiệu cung cấp: khoảng 30–200 triệu đồng. Không phải giá niêm yết hoặc báo giá cố định.</div></header><PackageCatalog packages={packages}/><section className="page-note"><h2>Điều gì ảnh hưởng đến chi phí?</h2><p>Phiên bản xe, lựa chọn phụ kiện, vật liệu, phạm vi thi công và thời điểm thực hiện. Hãy gửi các hạng mục bạn quan tâm để nhận phương án cấu hình phù hợp.</p></section></div><CTA/></div>; }
