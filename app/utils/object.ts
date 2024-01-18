import platformsCategories from "@/content/platforms/categories.json";
import modulesCategories from "@/content/modules/categories.json";
import expansionsCategories from "@/content/expansions/categories.json";
import templatesCategories from "@/content/templates/categories.json";
import componentTypes from "@/content/types.json";
import hots from "@/content/hots.json";
import matter from "gray-matter";
import * as fs from "fs";
import path from "path";

export function getCategories(component: string) {
  switch (component) {
    case "platforms":
      return platformsCategories;
    case "modules":
      return modulesCategories;
    case "expansions":
      return expansionsCategories;
    case "templates":
      return templatesCategories;
    default:
      return [];
  }
}

export function getCategoriesByNames(component: string, names: string[]) {
  const categories: { name: string; title: string }[] = [];
  const allCategories = getCategories(component);
  names.forEach((name) => {
    const category = allCategories.find((category) => category.name === name);
    if (category) {
      categories.push(category);
    }
  });
  return categories;
}

export function getComponentTypes() {
  return componentTypes;
}

export function getComponentTypesByName(name: string) {
  return componentTypes.find((component) => component.name === name);
}

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

export function getAllComponents(getContent: boolean = true) {
  const cwd = process.cwd();
  const files = [];
  files.push(...getFiles(path.resolve(cwd, `content`)));
  const filesMeta: any[] = [];
  files.forEach((file: any) => {
    filesMeta.push(getMetaData(file, getContent));
  }, {});
  let res: { name: string; title: string }[] = getCategories("all");
  const temp = JSON.parse(JSON.stringify(res));
  temp.unshift({
    name: "all",
    title: "所有",
  });
  return {
    categories: temp,
    components: filesMeta,
  };
}

export function getComponentsByType(type: string, getContent: boolean = true) {
  const cwd = process.cwd();
  const files = [];
  files.push(...getFiles(path.resolve(cwd, `content`, type)));
  const filesMeta: any[] = [];
  files.forEach((file: any) => {
    filesMeta.push(getMetaData(file, getContent));
  }, {});
  let res: { name: string; title: string }[] = getCategories(type);
  const temp = JSON.parse(JSON.stringify(res));
  temp.unshift({
    name: "all",
    title: "所有",
  });
  return {
    categories: temp,
    components: filesMeta,
  };
}

export function getComponentsByTypeAndCategory(type: string, category: string) {
  getComponentsByType(type).components.filter((component) =>
    component.categories.contains(category)
  );
}

export function getComponentByTypeAndName(type: string, name: string) {
  const cwd = process.cwd();
  const file = fs.readFileSync(
    path.resolve(cwd, "content", type, name + ".md")
  );
  const { data, content } = matter(file);
  const temp = JSON.parse(JSON.stringify(data));
  temp.type = getComponentTypesByName(type);
  temp.categories = getCategoriesByNames(type, data.categories);
  return { ...temp, content, name };
}

export function getHots() {
  return hots;
}

export function getMetaData(file: string, getContent: boolean = true) {
  const { data, content } = matter(fs.readFileSync(file));
  return {
    ...data,
    name: path.basename(file, ".md"),
    type: getComponentTypesByName(data.type),
    ...(getContent && { content }),
  };
}

export function getRequiredComponents() {
  return getAllComponents(false).components.filter(
    (component) => component.required
  );
}
