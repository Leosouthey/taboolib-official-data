import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { getCategoriesByNames } from "@/app/utils/category";

export async function GET(
  request: Request,
  { params }: { params: { component: string; name: string } }
) {
  const cwd = process.cwd();
  const component = params.component;
  const name = params.name;
  const file = fs.readFileSync(
    path.resolve(cwd, "content", component, name + ".md")
  );
  const { data, content } = matter(file);
  const temp = JSON.parse(JSON.stringify(data));
  temp.categories = getCategoriesByNames(component, data.categories);
  return Response.json({ ...temp, content, name });
}
