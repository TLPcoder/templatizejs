export = file;
declare function file(...args: any[]): any;
declare namespace file {
    export { fileUnresolved as unresolved };
    export { fileReadFile as readFile };
    export { fileReadFileSync as readFileSync };
    export { fileWriteFile as writeFile };
    export { fileWriteFileSync as writeFileSync };
}
declare function fileUnresolved(...args: any[]): any[];
declare function fileReadFile(...args: any[]): any;
declare function fileReadFileSync(...args: any[]): any;
declare function fileWriteFile(writeTo: any, ...args: any[]): any;
declare function fileWriteFileSync(writeTo: any, ...args: any[]): any;

export = json;
declare function json(...args: any[]): any;
declare namespace json {
    export { jsonUnresolved as unresolved };
    export { jsonReadFile as readFile };
    export { jsonReadFileSync as readFileSync };
    export { jsonWriteFile as writeFile };
    export { jsonWriteFileSync as writeFileSync };
}
declare function jsonUnresolved(...args: any[]): any[];
declare function jsonReadFile(...args: any[]): any;
declare function jsonReadFileSync(...args: any[]): any;
declare function jsonWriteFile(writeTo: any, ...args: any[]): any;
declare function jsonWriteFileSync(writeTo: any, ...args: any[]): any;

export = yaml;
declare function yaml(...args: any[]): any;
declare namespace yaml {
    export { yamlUnresolved as unresolved };
    export { yamlReadFile as readFile };
    export { yamlReadFileSync as readFileSync };
    export { yamlWriteFile as writeFile };
    export { yamlWriteFileSync as writeFileSync };
}
declare function yamlUnresolved(...args: any[]): any[];
declare function yamlReadFile(...args: any[]): any;
declare function yamlReadFileSync(...args: any[]): any;
declare function yamlWriteFile(writeTo: any, ...args: any[]): any;
declare function yamlWriteFileSync(writeTo: any, ...args: any[]): any;

