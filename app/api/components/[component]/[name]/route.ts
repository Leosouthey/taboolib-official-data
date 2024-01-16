import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

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
