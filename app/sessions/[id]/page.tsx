import SessionClient from "./SessionClient";

export default async function Page(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Next.js 15: params یک Promise است
  return <SessionClient id={id} />;
}
