// <============================================JSON============================================>


export = json;
declare function json(
    ource: Object | string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): Object;
declare namespace json {
    export { jsonUnresolved as unresolved };
    export { jsonReadFile as readFile };
    export { jsonReadFileSync as readFileSync };
    export { jsonWriteFile as writeFile };
    export { jsonWriteFileSync as writeFileSync };
}
declare function jsonUnresolved(
    source: Object | string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): [Array<string>, Object];
declare function jsonReadFile(
    source: Object | string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): Promise<Object>;
declare function jsonReadFileSync(
    source: Object | string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): Object;
declare function jsonWriteFile(
    writeTo: string,
    source: Object | string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string, callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): Promise<Object>;
declare function jsonWriteFileSync(
    writeTo: string,
    source: Object | string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string, callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): Object;


// <============================================YAML============================================>


export = yaml;
declare function yaml(
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): string;
declare namespace yaml {
    export { yamlUnresolved as unresolved };
    export { yamlReadFile as readFile };
    export { yamlReadFileSync as readFileSync };
    export { yamlWriteFile as writeFile };
    export { yamlWriteFileSync as writeFileSync };
}

declare function yamlUnresolved(
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): [Array<string>, string];

declare function yamlReadFile(
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): Promise<string>;

declare function yamlReadFileSync(
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): string;

declare function yamlWriteFile(
    writeTo: string,
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): Promise<string>;

declare function yamlWriteFileSync(
    writeTo: string,
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): string;


// <============================================FILE============================================>


export = file;
declare function file(
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): string;
declare namespace file {
    export { fileUnresolved as unresolved };
    export { fileReadFile as readFile };
    export { fileReadFileSync as readFileSync };
    export { fileWriteFile as writeFile };
    export { fileWriteFileSync as writeFileSync };
}
declare function fileUnresolved(
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): [Array<string>, string];
declare function fileReadFile(
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): Promise<string>;
declare function fileReadFileSync(
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): string;
declare function fileWriteFile(
    writeTo: string,
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string, callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): Promise<string>;
declare function fileWriteFileSync(
    writeTo: string,
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string, callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): string;