"use client";
type Props = { id: string };

export default function SettlementClient({ id }: Props) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Settlements for Session {id}</h1>
      {/* TODO: داده‌ها و UI واقعی تسویه‌ها را اینجا رندر کن */}
    </div>
  );
}
