import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { getCategories, getMetaData } from "@/app/utils/object";

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
    filesMeta.push(getMetaData(file));
  }, {});

  let content: { name: string; title: string }[] = getCategories(component);
  const temp = JSON.parse(JSON.stringify(content));
  temp.unshift({
    name: "all",
    title: "所有",
  });
  return Response.json({
    categories: temp,
    components: filesMeta,
  });
}
