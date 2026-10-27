# Triển khai Quốc Dương Auto lên Google Cloud

## Kiến trúc

- **Cloud Run** chạy ứng dụng Next.js trong container stateless.
- **Cloud SQL for PostgreSQL** lưu nội dung, lead, attribution và dữ liệu doanh thu.
- **Artifact Registry + Cloud Build** build và lưu image.
- **Secret Manager** giữ `DATABASE_URL`, mật khẩu admin và session secret; không đưa bí mật vào image hoặc Git.
- **Supabase Storage** tiếp tục lưu ảnh/video. App hiện đã hỗ trợ tải media trực tiếp lên Supabase và từ chối ghi file production vào filesystem Cloud Run (filesystem container không bền vững).
- Cloud Run được gắn Cloud SQL instance bằng Cloud SQL connector/socket. Dùng service account riêng, không dùng key JSON.

## Trước khi bắt đầu

Cần có Google Cloud project, billing đã bật, `gcloud` đã cài và đăng nhập, domain đã xác minh nếu muốn dùng domain riêng. Chọn region gần khách hàng và đặt Cloud Run, Cloud SQL, Artifact Registry cùng region. Các giá trị `<...>` dưới đây là chỗ bạn tự thay, không phải cấu hình thật.

```sh
gcloud auth login
gcloud config set project <PROJECT_ID>
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com sqladmin.googleapis.com secretmanager.googleapis.com

gcloud artifacts repositories create quocduong --location=<REGION> \
  --repository-format=docker --description="Quoc Duong Auto application images"
```

Tạo Cloud SQL PostgreSQL instance/database và một user riêng cho ứng dụng qua Console hoặc `gcloud sql`. Bật automated backups, đặt maintenance window, dùng mật khẩu riêng và giới hạn quyền DB. Không dùng `root` làm user của ứng dụng. Tạo service account riêng cho Cloud Run; cấp `roles/cloudsql.client`, `roles/secretmanager.secretAccessor` trên đúng secrets cần dùng. Cấp quyền push image cho Cloud Build service account (`roles/artifactregistry.writer`) trên repository. Không cấp Owner/Editor rộng cho runtime.

## Secrets và cấu hình

Tạo từng secret rỗng rồi thêm version bằng cách dán giá trị vào stdin; kết thúc bằng `Ctrl-D`. Giá trị bí mật không nằm trong shell history:

```sh
gcloud secrets create quocduong-database-url --replication-policy=automatic
gcloud secrets versions add quocduong-database-url --data-file=-
gcloud secrets create quocduong-admin-password --replication-policy=automatic
gcloud secrets versions add quocduong-admin-password --data-file=-
gcloud secrets create quocduong-admin-session-secret --replication-policy=automatic
gcloud secrets versions add quocduong-admin-session-secret --data-file=-
```

`DATABASE_URL` cần trỏ tới database Cloud SQL. Với Cloud SQL connector trên Cloud Run, dùng Unix socket host theo dạng `?host=/cloudsql/<PROJECT_ID>:<REGION>:<INSTANCE_NAME>` (URL-encode nếu password có ký tự đặc biệt). Không mở database ra Internet công cộng. Kiểm tra kết nối bằng Cloud SQL Auth Proxy/connector trước khi deploy.

Tạo user admin bằng secret `ADMIN_USERNAME` (hoặc truyền biến môi trường không bí mật), và dùng password/session secret riêng cho production. Cấu hình thêm trên Cloud Run:

- `ADMIN_USERNAME`: tên đăng nhập production.
- `NEXT_PUBLIC_SITE_URL`: canonical HTTPS domain; giá trị này được nhúng lúc build, phải build lại khi domain đổi.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`: secrets/config của media storage; tiếp tục bắt buộc để upload ảnh/video production. Đặt bucket public-read cho nội dung marketing và giới hạn write bằng signed upload endpoint; bật CORS cho domain website, giới hạn loại file và dung lượng theo app.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public config cho signed uploads, nếu dùng luồng upload trực tiếp từ trình duyệt.
- Các ID GTM/GA4/Ads/Meta chỉ cấu hình sau khi có ID thật và duyệt consent; để trống thì tracking không bật.
- `NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION` chỉ cấu hình sau khi xác minh domain.

Không thiết lập `DATABASE_URL` trực tiếp qua `--set-env-vars`; gắn secret version bằng `--set-secrets`. Tạo các secrets Supabase tương tự, và chỉ cấp quyền đọc cho service account runtime.

## Build và deploy

Build image bằng Cloud Build. Thay region/repository/image/site URL theo project:

```sh
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_REGION=<REGION>,_REPOSITORY=quocduong,_IMAGE=website,_SITE_URL=https://<DOMAIN>
```

Deploy Cloud Run (thay tên instance và service account; thêm mapping cho Supabase secrets đã tạo):

```sh
gcloud run deploy quocduong-auto \
  --image=<REGION>-docker.pkg.dev/<PROJECT_ID>/quocduong/website:<COMMIT_SHA> \
  --region=<REGION> --platform=managed --allow-unauthenticated \
  --service-account=<RUNTIME_SERVICE_ACCOUNT> \
  --add-cloudsql-instances=<PROJECT_ID>:<REGION>:<INSTANCE_NAME> \
  --set-env-vars=ADMIN_USERNAME=<ADMIN_USERNAME>,NODE_ENV=production \
  --set-secrets=DATABASE_URL=quocduong-database-url:latest,ADMIN_PASSWORD=quocduong-admin-password:latest,ADMIN_SESSION_SECRET=quocduong-admin-session-secret:latest \
  --memory=1Gi --cpu=1 --min=0 --max=5 --concurrency=20 --timeout=300
```

Giới hạn concurrency/scale cần điều chỉnh theo tải và connection limit của Cloud SQL. App dùng Prisma/pg; không đặt max instances cao trước khi tính connection pool. Cloud Run cần HTTPS ingress; sau deploy, map custom domain, xác minh HTTPS và chuyển DNS. Không chạy container với filesystem làm nơi lưu dữ liệu bền vững.

## Database và nội dung trước cutover

1. Backup local PostgreSQL và database đích trước thao tác.
2. Migrate nội dung/lead cần giữ sang Cloud SQL; bảo vệ dữ liệu cá nhân khi export/import.
3. Đồng bộ schema production bằng một lần chạy kiểm soát từ máy có Cloud SQL Auth Proxy: `DATABASE_URL='<Cloud SQL URL>' npm run db:push`. Không chạy schema push tự động ở mỗi lần khởi động container.
4. Chuyển ảnh/video local hiện có lên Supabase Storage theo hướng dẫn `npm run storage:migrate:dry-run`, rà kết quả, sau đó `npm run storage:migrate:apply` với URL database đích.
5. Sau deploy, kiểm tra trang chủ, `/admin`, upload ảnh và video, gửi lead thử, bản ghi trong Cloud SQL, sitemap/robots và logs. Dùng dữ liệu test được đánh dấu, xóa theo chính sách sau khi xác nhận.

## Vận hành

- Cloud Run logs và error reporting nằm trong Cloud Logging; bật alert cho 5xx, latency, instance saturation và lỗi kết nối DB.
- Bật Cloud SQL automated backups/PITR phù hợp RPO/RTO; thử phục hồi backup trước ngày launch.
- Thiết lập ngân sách/cảnh báo billing. Google Cloud có tính phí theo tài nguyên và khu vực; xác nhận giá hiện hành trước khi chọn cấu hình.
- Cấu hình custom domain, canonical redirect www/non-www, Search Console, sitemap và chính sách quyền riêng tư trước khi chạy quảng cáo.
- Rate limit hiện tại chạy trong process, không chia sẻ giữa instances; trước khi quảng cáo thực tế, đặt Cloud Armor/load balancer hoặc shared rate-limit store phù hợp. Theo dõi Cloud Run instance scale để không vượt sức tải database.
- Không bật offline conversion/Meta CAPI cho đến khi đã có quy trình nghiệp vụ xác thực trạng thái lead/đơn, consent phù hợp và dispatcher idempotent.

## Kiểm tra trước production

```sh
npm run typecheck
npm run lint
npm run build
```

Smoke test sau deploy: HTTPS và canonical metadata; đăng nhập admin; tạo/sửa nội dung; upload ảnh/video; form hợp lệ/không hợp lệ; lead + attribution lưu đúng; reload trang không phát sinh lead trùng; consent từ chối không kích hoạt marketing tags; logs không chứa PII hoặc secrets. Không coi form submit là doanh thu.
