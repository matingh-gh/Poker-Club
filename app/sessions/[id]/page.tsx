import SessionClient from "./SessionClient";
import type { PageProps } from "next";

export default async function Page(
  { params }: PageProps<{ id: string }>
) {
  const { id } = await params;
  return <SessionClient id={id} />;
}
