import components from "@/content/components.json";
import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import platformsCategories from "@/content/platforms/categories.json";
import modulesCategories from "@/content/modules/categories.json";
import expansionsCategories from "@/content/expansions/categories.json";
import templatesCategories from "@/content/templates/categories.json";

export async function GET(
  request: Request,
  { params }: { params: { component: string; name: string } }
) {
  const cwd = process.cwd();
  const component = params.component;
  const name = params.name;
  const file = fs.readFileSync(
    path.join(process.cwd(), "content", component, name + ".md")
  );
  const { data, content } = matter(file);
  return Response.json({ ...data, content, name });
}
