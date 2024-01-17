import platformsCategories from "@/content/platforms/categories.json";
import modulesCategories from "@/content/modules/categories.json";
import expansionsCategories from "@/content/expansions/categories.json";
import templatesCategories from "@/content/templates/categories.json";
import components from "@/content/components.json";
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

export function getComponents() {
  return components;
}

export function getComponentByName(name: string) {
  return components.find((component) => component.name === name);
}

export function getHots() {
  return hots;
}

export function getMetaData(file: string) {
  const { data } = matter(fs.readFileSync(file));
  return {
    ...data,
    name: path.basename(file, ".md"),
    component: getComponentByName(data.component),
  };
}
