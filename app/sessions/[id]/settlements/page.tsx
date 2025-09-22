import SettlementClient from "./SettlementClient";
import type { PageProps } from "next";

export default async function Page(
  { params }: PageProps<{ id: string }>
) {
  const { id } = await params;
  return <SettlementClient id={id} />;
}
