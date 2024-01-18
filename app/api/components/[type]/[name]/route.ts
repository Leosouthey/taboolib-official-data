import { getComponentByTypeAndName } from "@/app/utils/object";

export async function GET(
  request: Request,
  { params }: { params: { type: string; name: string } }
) {
  return Response.json(getComponentByTypeAndName(params.type, params.name));
}
