import components from "@/content/components.json";
import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import platformsCategories from "@/content/platforms/categories.json";
import modulesCategories from "@/content/modules/categories.json";
import expansionsCategories from "@/content/expansions/categories.json";
import templatesCategories from "@/content/templates/categories.json";

function getFiles(dir: string) {
  const files: any[] = [];
  fs.readdirSync(dir).forEach((file: any) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      files.push(...getFiles(filePath));
    } else if (path.extname(file) === ".md") {
      files.push(filePath);
    }
  });
  return files;
}

export async function GET(
  request: Request,
  { params }: { params: { component: string } }
) {
  const cwd = process.cwd();
  const component = params.component;
  const files = [];
  if (component === "all") {
    files.push(...getFiles(path.resolve(cwd, `content`)));
  } else {
    files.push(...getFiles(path.resolve(cwd, `content/${component}`)));
  }
  const filesMeta: {}[] = [];
  files.forEach((file: any) => {
    const { data } = matter(fs.readFileSync(file));
    filesMeta.push({
      name: path.basename(file, ".md"),
      ...data,
    });
  }, {});
  switch (component) {
    case "platforms":
      return Response.json({
        categories: platformsCategories,
        components: filesMeta,
      });
    case "modules":
      return Response.json({
        categories: modulesCategories,
        components: filesMeta,
      });
    case "expansions":
      return Response.json({
        categories: expansionsCategories,
        components: filesMeta,
      });
    case "templates":
      return Response.json({
        categories: templatesCategories,
        components: filesMeta,
      });
    default:
      return Response.json({
        components,
      });
  }
}