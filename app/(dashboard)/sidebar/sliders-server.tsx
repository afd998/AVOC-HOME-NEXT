import { db } from "@/lib/db";
import { Sliders } from "./sliders";
import { getMyControls, saveMyControls } from "@/lib/data/controls";

export default async function SliderServer() {
  const controls = await getMyControls();

  return <Sliders initial={controls} onUpdate={saveMyControls} />;
}
