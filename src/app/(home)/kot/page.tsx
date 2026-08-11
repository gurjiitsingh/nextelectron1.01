import SyncButton from "../SyncButton";

export default function Page() {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-100 p-4">
      <div className="text-xl font-semibold text-slate-800">
        KOT Screen
      </div>
  <SyncButton />
      <div className="mt-2 text-sm text-slate-500">
        KOT orders will appear here.
      </div>
    </main>
  );
}