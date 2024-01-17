import { getHots, getMetaData } from "@/app/utils/object";
import path from "path";

export async function GET() {
  const cwd = process.cwd();
  const temp: any[] = [];
  getHots().forEach((hot) => {
    const component = hot.component;
    const name = hot.name;
    temp.push(
      getMetaData(path.resolve(cwd, `content/${component}/${name}.md`))
    );
  });
  return Response.json(temp);
}
