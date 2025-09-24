import SettlementsClient from "./SettlementsClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SettlementsClient sessionId={id} />;
}
