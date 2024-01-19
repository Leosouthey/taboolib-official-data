import JSZip from "jszip";
import fs from "fs";
import path from "path";

export async function buildSDK(
  components: any[],
  project: { name: string; package: string }
) {
  const zip = await getSDKZip();
  await writeBuildFile(zip, components);
  await writeSettingsFile(zip, project);
  await writeGradleFile(zip, project);
  await writeSrcFile(zip, project);
  const data = await zip.generateAsync({ type: "blob" });
  return data;
}

async function getSDKZip() {
  const zip = new JSZip();
  const sdkPath = path.join(process.cwd(), "content", "sdk.zip");
  const data = fs.readFileSync(sdkPath);
  const sdk = zip.loadAsync(data);
  if (sdk) {
    return sdk;
  } else {
    throw new Error("SDK not found");
  }
}

async function writeSrcFile(
  zip: JSZip,
  project: { package: string; name: string }
) {
  zip.folder("src")?.folder("main")?.folder("resources");
  const contents: string[] = [];
  writeLine(contents, `package ${project.package}`, 0);
  writeLine(contents, "", 0);
  writeLine(contents, "import taboolib.common.platform.Plugin", 0);
  writeLine(contents, "import taboolib.common.platform.function.info", 0);
  writeLine(contents, "", 0);
  writeLine(contents, "object ExampleProject : Plugin() {", 0);
  writeLine(contents, "", 0);
  writeLine(contents, "override fun onEnable() {", 1);
  writeLine(contents, 'info("Hello TabooLib!")', 2);
  writeLine(contents, "}", 1);
  writeLine(contents, "}", 0);
  zip.file(
    path.join(
      "src",
      "main",
      "kotlin",
      ...project.package.split("."),
      project.name + ".kt"
    ),
    contents.join("")
  );
}

async function writeGradleFile(zip: JSZip, project: { package: string }) {
  const contents: string[] = [];
  writeLine(contents, `group=${project.package}`, 0);
  writeLine(contents, "version=1.0.0", 0);
  writeToZip(contents, zip, "gradle.properties");
}

async function writeBuildFile(zip: JSZip, components: any[]) {
  const contents: string[] = [];
  writeLine(contents, "plugins {", 0);
  writeLines(
    contents,
    [
      "`java-library`",
      "`maven-publish`",
      'id("org.jetbrains.kotlin.jvm") version "1.5.10"',
    ],
    1
  );
  const tabooLibPluginVersion = await getTabooLibPluginVersion();
  const tabooLibPlugin = `id("io.izzel.taboolib") version "${tabooLibPluginVersion}"`;
  writeLine(contents, tabooLibPlugin, 1);
  writeLine(contents, "}", 0);
  writeLine(contents, "", 0);
  writeLine(contents, "taboolib {", 0);
  components.forEach((component) => {
    writeLine(contents, `install("${component.name}")`, 1);
  });
  writeLine(contents, "classifier = null", 1);
  const version = await getTabooLibVersion();
  writeLine(contents, `version = "${version}"`, 1);
  writeLine(contents, "}", 0);
  writeLine(contents, "", 0);
  writeLine(contents, "repositories {", 0);
  writeLine(contents, "mavenCentral()", 1);
  components.forEach((component) => {
    if (component.name === "platform-nukkit") {
      writeLine(
        contents,
        `maven { url = uri("https://repo.nukkitx.com/maven-snapshots") }`,
        1
      );
    }
    if (
      component.name === "platform-sponge-api7" ||
      component.name === "platform-sponge-api8"
    ) {
      writeLine(
        contents,
        `maven { url = uri("https://repo.spongepowered.org/maven") }`,
        1
      );
    }
    if (component.name === "platform-velocity") {
      writeLine(
        contents,
        `maven { url = uri("https://nexus.velocitypowered.com/repository/maven-public/") }`,
        1
      );
    }
    writeLine(contents, `}`, 0);
    writeLine(contents, "", 0);
    writeLine(contents, "dependencies {", 0);
    if (component.name === "platform-bukkit") {
      writeLine(contents, `compileOnly("ink.ptms:nms-all:1.0.0")`, 1);
      writeLine(
        contents,
        `compileOnly("ink.ptms.core:v12004:12004:mapped")`,
        1
      );
      writeLine(
        contents,
        `compileOnly("ink.ptms.core:v12004:12004:universal")`,
        1
      );
    }
    if (component.name === "platform-bungee") {
      writeLine(contents, `compileOnly("net.md_5.bungee:BungeeCord:1")`, 1);
    }
    if (component.name === "platform-nukkit") {
      writeLine(contents, `compileOnly("cn.nukkit:nukkit:2.0.0-SNAPSHOT")`, 1);
    }
    if (component.name === "platform-sponge-api7") {
      writeLine(
        contents,
        `compileOnly("org.spongepowered:spongeapi:7.2.0")`,
        1
      );
    }
    if (component.name === "platform-sponge-api8") {
      writeLine(
        contents,
        `compileOnly("org.spongepowered:spongeapi:8.0.0-SNAPSHOT")`,
        1
      );
    }
    if (component.name === "platform-velocity") {
      writeLine(
        contents,
        `compileOnly("com.velocitypowered:velocity-api:1.1.8")`,
        1
      );
    }
    writeLines(
      contents,
      [`compileOnly(kotlin("stdlib"))`, `compileOnly(fileTree("libs"))`],
      1
    );
    writeLine(contents, `}`, 0);
    writeLine(contents, "", 0);
    writeLine(contents, "tasks.withType<JavaCompile> {", 0);
    writeLine(contents, `options.encoding = "UTF-8"`, 1);
    writeLine(contents, "}", 0);
    writeLine(contents, "", 0);
    writeLine(
      contents,
      "tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {",
      0
    );
    writeLine(contents, `kotlinOptions {`, 1);
    writeLine(contents, `freeCompilerArgs = listOf("-Xjvm-default=all")`, 2);
    writeLine(contents, `jvmTarget = "1.8"`, 2);
    writeLine(contents, `}`, 1);
    writeLine(contents, "}", 0);
    writeLine(contents, "", 0);
    writeLine(contents, "configure<JavaPluginConvention> {", 0);
    writeLine(contents, `sourceCompatibility = JavaVersion.VERSION_1_8`, 1);
    writeLine(contents, `targetCompatibility = JavaVersion.VERSION_1_8`, 1);
    writeLine(contents, "}", 0);
    writeLine(contents, "", 0);
    let publishing = `\npublishing {
    repositories {
        maven {
            url = uri("https://repo.tabooproject.org/repository/releases")
            credentials {
                username = project.findProperty("taboolibUsername").toString()
                password = project.findProperty("taboolibPassword").toString()
            }
            authentication {
                create<BasicAuthentication>("basic")
            }
        }
    }
    publications {
        create<MavenPublication>("library") {
            from(components["java"])
            groupId = project.group.toString()
        }
    }
}`;
    writeLine(contents, publishing, 0);
    writeToZip(contents, zip, "build.gradle.kts");
  });
}

async function writeSettingsFile(zip: JSZip, project: { name: string }) {
  zip.file("settings.gradle.kts", "rootProject.name=" + project.name);
}

async function writeLine(contents: string[], line: string, indent: number) {
  contents.push(`${"    ".repeat(indent)}${line}\n`);
}

async function writeLines(contents: string[], lines: string[], indent: number) {
  for (const line of lines) {
    await writeLine(contents, line, indent);
  }
}

async function writeToZip(contents: string[], zip: JSZip, path: string) {
  zip.file(path, contents.join(""));
}

async function getTabooLibVersion() {
  const response = await fetchWithGithubAuth(
    "https://api.github.com/repos/TabooLib/taboolib/releases/latest"
  );
  const data = await response.json();
  return data["tag_name"];
}

async function getTabooLibPluginVersion() {
  const response = await fetchWithGithubAuth(
    "https://api.github.com/repos/TabooLib/TabooLib-Gradle-Plugin/releases/latest"
  );
  const data = await response.json();
  return data["tag_name"];
}

export function fetchWithGithubAuth(url: string, options?: RequestInit) {
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
    cache: "no-cache",
  });
}
