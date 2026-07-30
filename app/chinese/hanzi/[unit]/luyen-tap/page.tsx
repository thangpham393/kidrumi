"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { findUnit } from "../../data";
import UnitQuiz from "@/components/hanzi/UnitQuiz";

export default function UnitQuizPage() {
  const params = useParams<{ unit: string }>();
  const unit = findUnit(params.unit);

  if (!unit) {
    return (
      <main className="wrap lt-wrap">
        <p className="page-sub">Không tìm thấy đơn vị này.</p>
        <p style={{ textAlign: "center" }}>
          <Link href="/chinese/hanzi" className="btn btn-ghost">← Về lớp học chữ</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="wrap lt-wrap lt-zh hz-study">
      <header className="lt-top">
        <Link href={`/chinese/hanzi/${unit.id}`} className="pill" aria-label="Quay lại">
          ← {unit.title}
        </Link>
        <h1 className="lt-title">Luyện tập 🎯</h1>
        <span aria-hidden />
      </header>

      <UnitQuiz key={unit.id} unit={unit} />
    </main>
  );
}
