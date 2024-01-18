import { getRequiredComponents } from "@/app/utils/object";

export async function GET() {
  return Response.json(getRequiredComponents());
}
