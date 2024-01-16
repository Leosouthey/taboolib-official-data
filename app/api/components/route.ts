import components from "@/content/components.json";

export async function GET() {
  const temp = JSON.parse(JSON.stringify(components));
  temp.unshift({
    name: "all",
    title: "所有",
  });
  return Response.json(temp);
}
