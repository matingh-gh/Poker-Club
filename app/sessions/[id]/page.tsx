import SessionClient from "./SessionClient";

export default function Page({ params }: { params: { id: string } }) {
  return <SessionClient id={params.id} />;
}
