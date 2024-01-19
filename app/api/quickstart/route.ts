import { getRequiredComponents } from "@/app/utils/object";
import { buildSDK } from "@/app/utils/sdk";

export async function POST(request: Request) {
  const body = await request.json();

  const { project, components } = body;
  const required = getRequiredComponents();
  const allComponents = required.concat(components);
  const sdk = await buildSDK(allComponents, project);
  return new Response(sdk, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="sdk.zip"',
    },
  });
}
