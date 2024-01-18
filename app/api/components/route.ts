import { getComponentTypes } from "@/app/utils/object";

export async function GET() {
  const temp = JSON.parse(JSON.stringify(getComponentTypes()));
  temp.unshift({
    name: "all",
    title: "所有",
  });
  return Response.json(temp);
}
