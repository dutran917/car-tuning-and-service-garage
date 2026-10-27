"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ManagedPackage } from "@/lib/managed-content";

export function PackageCatalog({ packages }: { packages: ManagedPackage[] }) {
  const [vehicle, setVehicle] = useState("all");
  const [style, setStyle] = useState("all");
  const [budget, setBudget] = useState("all");
  const vehicles = useMemo(() => [...new Set(packages.map((item) => item.vehicle))], []);
  const styles = useMemo(() => [...new Set(packages.map((item) => item.style))], []);
  const filtered = packages.filter((item) => (vehicle === "all" || vehicle === item.vehicle) && (style === "all" || item.style === style) && (budget === "all" || item.range.startsWith(budget)));
  return <>
    <div className="package-filters" aria-label="Lọc gói nâng cấp">
      <label>Dòng xe<select value={vehicle} onChange={(event) => setVehicle(event.target.value)}><option value="all">Tất cả dòng xe</option>{vehicles.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Phong cách<select value={style} onChange={(event) => setStyle(event.target.value)}><option value="all">Tất cả phong cách</option>{styles.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Ngân sách tham khảo<select value={budget} onChange={(event) => setBudget(event.target.value)}><option value="all">Tất cả mức ngân sách</option><option value="30–60">30–60 triệu đồng</option><option value="60–120">60–120 triệu đồng</option><option value="120–200">120–200 triệu đồng</option></select></label>
      <span className="filter-count" aria-live="polite">{filtered.length} gợi ý</span>
    </div>
    {filtered.length ? <div className="package-grid">{filtered.map((item, index) => { const cover = item.images[0]?.url || item.imageUrl; return <article className="package-card" key={item.slug}><div className={`package-art package-art-${index + 1}`} style={cover ? { backgroundImage: `linear-gradient(0deg,rgba(13,15,14,.72),rgba(13,15,14,.06)),url("${cover}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}><span>{item.style}</span><strong>VF3<small> / {String(index + 1).padStart(2, "0")}</small></strong><span className="package-art-mark"><Image src="/logo-quoc-duong-auto.png" alt="Quốc Dương Auto" width={352} height={157}/></span></div><div className="package-info"><div className="package-kicker">GỢI Ý CẤU HÌNH · {item.vehicle.toUpperCase()}</div><h3><Link href={`/goi-do/${item.slug}`}>{item.name}</Link></h3><p>{item.text}</p><div className="package-range">{item.range}<small> · tham khảo</small></div><Link className="arrow-link" href={`/goi-do/${item.slug}`}>Xem cấu hình <span>↗</span></Link></div></article>; })}</div> : <div className="empty-state"><strong>Chưa có gợi ý phù hợp.</strong><p>Thử thay đổi bộ lọc hoặc gửi nhu cầu để được tư vấn cấu hình riêng.</p><Link href="/tu-van">Tư vấn cấu hình ↗</Link></div>}
  </>;
}
