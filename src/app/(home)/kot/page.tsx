import TestPrinter from "@/components/systemButton/TestPrinter";
import SyncButton from "../SyncButton";
import UploadOrderCounterButton from "../UploadOrderCounterButton";

export default function Page() {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-100 p-4">
      <div className="text-xl font-semibold text-slate-800">
      Setting Buttons
      </div>
      <div className="flex gap-2">
  <SyncButton />
   <UploadOrderCounterButton />
   <TestPrinter />
    </div>
    </main>
  );
}