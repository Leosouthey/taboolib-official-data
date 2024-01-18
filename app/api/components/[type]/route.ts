import { getAllComponents, getComponentsByType } from "@/app/utils/object";

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  const type = params.type;
  if (type === "all") {
    return Response.json(getAllComponents(false));
  }
  return Response.json(getComponentsByType(type, false));
}
