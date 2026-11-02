export const site = {
  name: "Quốc Dương Auto",
  descriptor: "Car Tuning & Service",
  tagline: "Biến chiếc xe nguyên bản thành chiếc xe của riêng bạn.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  facebook: "https://www.facebook.com/profile.php?id=100063240608455",
  phone: "0399513456",
  phoneDisplay: "0399.513.456",
  zalo: "https://zalo.me/0399513456",
  email: "ductcp@gmail.com",
  address: "Cẩm Phả, Quảng Ninh",
};

export const services = [
  { slug: "noi-that", title: "Nội thất cá nhân hóa (Bespoke)", short: "Ghế da Nappa cao cấp, vô-lăng Carbon, trần sao và những điểm chạm chuẩn gu riêng.", icon: "01", detail: "Nâng cấp khoang lái theo tiêu chuẩn tinh xảo: da Nappa cao cấp kháng khuẩn, tạo phom ghế thể thao ôm lưng, bọc vô-lăng Carbon sợi, tích hợp làm mát ghế và đèn Ambient Light đa sắc đồng bộ." },
  { slug: "ngoai-that-body-kit", title: "Ngoại thất & Body Kit thể thao", short: "Kiến tạo diện mạo uy lực, khí động học với bodykit Brabus, G63, cản trước sau và đuôi gió thể thao.", icon: "02", detail: "Cung cấp và lắp đặt bodykit chính xác từng milimet cho VinFast VF3 và các dòng SUV. Chất liệu nhựa PP/ABS cao cấp sơn sấy nhiệt độ tiêu chuẩn, giữ nguyên kết cấu khung gầm và an toàn vận hành." },
  { slug: "mam-lop", title: "Mâm đúc & Lốp Performance", short: "Đa dạng kiểu dáng mâm đúc thể thao 16–18 inch, cân mâm bấm chì và căn chỉnh độ chụm chuẩn xác.", icon: "03", detail: "Tư vấn chuẩn thông số offset (ET), PCD và kích thước lốp tối ưu cho từng cung đường. Tăng cường độ bám đường, êm ái khi di chuyển và tôn trọn vóc dáng khỏe khoắn của xế cưng." },
  { slug: "anh-sang-tien-nghi", title: "Ánh sáng & Tiện nghi công nghệ", short: "Nâng cấp Bi-LED laser siêu sáng, dải LED định vị ma trận, màn hình thông minh và âm thanh vòm.", icon: "04", detail: "Giải pháp chiếu sáng an toàn không gây chói mắt xe đối diện, cắm giắc zin 100% không cắt trích dây điện. Tích hợp màn hình Android, camera 360 toàn cảnh sắc nét và dàn loa nâng cấp âm trường sống động." },
  { slug: "cach-am-phu-kien", title: "Cách âm chống ồn & Phụ kiện", short: "Triệt tiêu rung ồn gầm, tiếng gió bằng vật liệu cách âm đa lớp cao cấp; cửa hít và cốp điện êm ái.", icon: "05", detail: "Dán cách âm 3 lớp chuyên dụng không mùi, tiêu âm khoang động cơ, 4 hốc bánh và sàn xe. Kết hợp phụ kiện nâng cấp thiết thực: cửa hít thông minh, cốp điện đóng mở tự động và film cách nhiệt cao cấp." },
  { slug: "tu-van-concept", title: "Thiết kế Concept bản độ riêng", short: "Hiện thực hóa ý tưởng từ phối màu, lựa chọn đồ chơi đến hoàn thiện tổng thể theo cá tính của bạn.", icon: "06", detail: "Đồng hành cùng chủ xe từ giai đoạn lên ý tưởng 3D, lựa chọn bài độ tối ưu trong ngân sách, đến lộ trình thi công bài bản và nghiệm thu bàn giao chuyên nghiệp." },
];

export const packages = [
  { slug: "vf3-phong-cach-hang-ngay", name: "VF3 · Chất riêng mỗi ngày", vehicle: "VinFast VF3", style: "Nâng cấp tiện nghi", budget: "Tư vấn theo cấu hình", range: "30–60 triệu đồng tham khảo", text: "Các nâng cấp được chọn theo trải nghiệm sử dụng hằng ngày. Danh mục và chi phí thay đổi theo lựa chọn phụ kiện, phiên bản xe và khảo sát thực tế.", items: ["Tư vấn concept theo nhu cầu", "Chọn hạng mục nội thất hoặc tiện nghi", "Xác nhận tương thích trước khi lắp", "Báo giá chi tiết trước khi thi công"] },
  { slug: "vf3-ca-tinh-do-thi", name: "VF3 · Cá tính đô thị", vehicle: "VinFast VF3", style: "Ngoại thất & nội thất", budget: "Tư vấn theo cấu hình", range: "60–120 triệu đồng tham khảo", text: "Một cấu hình tham khảo để bắt đầu trao đổi về diện mạo và trải nghiệm khoang lái. Không phải gói hàng hóa cố định; hạng mục chỉ được chốt sau tư vấn.", items: ["Định hướng phong cách tổng thể", "Tham khảo hạng mục ngoại thất", "Tùy chọn nâng cấp khoang lái", "Báo giá theo phụ kiện và công lắp"] },
  { slug: "vf3-dau-an-rieng", name: "VF3 · Dấu ấn riêng", vehicle: "VinFast VF3", style: "Concept cá nhân hóa", budget: "Tư vấn theo cấu hình", range: "120–200 triệu đồng tham khảo", text: "Dành cho chủ xe muốn phát triển concept nhiều hạng mục. Phạm vi, tính tương thích, tiến độ và chi phí cần khảo sát, xác nhận riêng.", items: ["Tư vấn concept theo ngân sách", "Phối hợp nhiều nhóm nâng cấp", "Thống nhất vật tư và phạm vi thi công", "Lịch thực hiện xác nhận theo cấu hình"] },
];

export const articles = [
  { slug: "bat-dau-nang-cap-vinfast-vf3-tu-dau", title: "Bắt đầu nâng cấp VinFast VF3 từ đâu?", category: "Cẩm nang VF3", date: "2026-10-23", intro: "Cách xác định nhu cầu, thứ tự ưu tiên và ngân sách trước khi chọn phụ kiện cho VF3.", body: ["Một bản nâng cấp hợp lý bắt đầu từ cách bạn dùng xe. Hãy ghi lại điều muốn cải thiện: cảm giác khoang lái, diện mạo bên ngoài, tiện nghi hay một hạng mục cụ thể.", "Tiếp theo, chia danh sách thành hạng mục cần làm và hạng mục có thể thực hiện sau. Cách này giúp cuộc tư vấn đi thẳng vào ưu tiên và giữ cấu hình trong ngân sách dự kiến.", "Trước khi chốt, nên xác nhận phụ kiện tương thích với đúng phiên bản xe, phạm vi lắp đặt, thời gian dự kiến, chi phí phát sinh có thể có và điều kiện bảo hành của từng sản phẩm."], related: "tu-van-concept" },
  { slug: "chon-goi-do-xe-theo-ngan-sach", title: "Chọn gói độ xe theo ngân sách và nhu cầu", category: "Kinh nghiệm nâng cấp", date: "2026-10-23", intro: "Một khung trao đổi thực tế để so sánh hạng mục và tránh chọn cấu hình theo cảm tính.", body: ["Ngân sách nên được xem như giới hạn để ưu tiên hạng mục, không phải cam kết một gói cố định. Giá thay đổi theo sản phẩm, cấu hình xe và phạm vi thi công.", "Hãy so sánh báo giá theo từng dòng: sản phẩm, số lượng, công lắp, thời gian dự kiến và điều kiện bảo hành do đơn vị cung cấp xác nhận. Cấu trúc này giúp bạn hiểu khoản chi dành cho từng lựa chọn.", "Nếu chưa muốn thực hiện toàn bộ, có thể hỏi phương án chia thành nhiều giai đoạn và xác nhận khả năng tương thích giữa các hạng mục."], related: "noi-that" },
  { slug: "luu-y-khi-chon-body-kit-cho-xe", title: "Những điều cần hỏi trước khi chọn body kit", category: "Ngoại thất", date: "2026-10-23", intro: "Tương thích, phương án lắp và hoàn thiện là những câu hỏi nên được làm rõ trước khi đặt phụ kiện.", body: ["Trước khi chọn body kit, xác định rõ dòng xe, phiên bản và năm sản xuất. Cùng tên mẫu xe có thể có khác biệt ảnh hưởng đến khả năng lắp đặt.", "Hỏi rõ bộ sản phẩm gồm những chi tiết nào, có cần chỉnh sửa hay sơn hoàn thiện không, thời gian dự kiến và cách xử lý nếu phát sinh không tương thích.", "Đề nghị xác nhận bằng báo giá trước khi thi công. Không nên suy luận chất lượng hoặc độ vừa khít chỉ từ ảnh minh họa."], related: "ngoai-that-body-kit" },
];

export const faq = [
  { q: "Gói độ VF3 có giá cố định không?", a: "Các mức ngân sách trên website chỉ để tham khảo. Giá cuối cùng phụ thuộc hạng mục, phụ kiện, phiên bản xe và phạm vi thi công sau khi tư vấn." },
  { q: "Tôi chưa biết nên nâng cấp hạng mục nào, có thể tư vấn trước không?", a: "Có. Bạn có thể gửi nhu cầu, ngân sách dự kiến và phong cách mong muốn qua biểu mẫu để bắt đầu trao đổi cấu hình." },
  { q: "Thời gian thi công mất bao lâu?", a: "Thời gian tùy cấu hình và tình trạng phụ kiện. Gara sẽ xác nhận dự kiến sau khi thống nhất danh mục cần làm." },
  { q: "Phụ kiện có tương thích với xe của tôi không?", a: "Tương thích cần xác nhận theo dòng xe, phiên bản và sản phẩm cụ thể trước khi báo giá và lắp đặt." },
  { q: "Chính sách bảo hành được áp dụng thế nào?", a: "Điều kiện bảo hành tùy sản phẩm và hạng mục. Vui lòng yêu cầu xác nhận điều kiện cụ thể trong báo giá trước khi thực hiện." },
];
