import { Breadcrumb, ArticleCards, CTA } from "@/components/Sections";
import { pageMetadata } from "@/lib/seo";
import { getManagedArticles } from "@/lib/managed-content";
export const metadata=pageMetadata("Cẩm nang nâng cấp ô tô và VinFast VF3", "Bài viết giúp chủ xe chuẩn bị lựa chọn phụ kiện, ngân sách và câu hỏi trước khi nâng cấp xe.","/kien-thuc");
export const dynamic="force-dynamic";
export default async function KnowledgePage(){const posts=await getManagedArticles();return <><div className="container page-wrap"><Breadcrumb items={[{label:"Kiến thức"}]}/><header className="page-intro"><div className="eyebrow"><span className="eyebrow-line"/>FIELD NOTES</div><h1>Hiểu rõ hơn<br/><span>trước mỗi lựa chọn.</span></h1><p>Cẩm nang tham khảo khi lên ý tưởng, chọn hạng mục và trao đổi cấu hình nâng cấp.</p></header><ArticleCards items={posts}/><div className="disclosure">Nội dung mang tính hướng dẫn chung. Hãy xác nhận khả năng tương thích và thông tin sản phẩm theo xe thực tế.</div></div><CTA/></>;}
