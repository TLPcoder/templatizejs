// <============================================JSON============================================>

declare function json(
    source: Object | string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): Object;
declare namespace json {
    function unresolved(
        source: Object | string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string,
        callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): [Object, Array<string>];
    function readFile(
        source: Object | string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string,
        callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): Promise<Object>;
    function readFileSync(
        source: Object | string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string,
        callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): Object;
    function writeFile(
        writeTo: string,
        source: Object | string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string, callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): Promise<Object>;
    function writeFileSync(
        writeTo: string,
        source: Object | string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string, callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): Object;
}


// <============================================YAML============================================>


export declare function yaml(
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): string;
export declare namespace yaml {
    function unresolved(
        source: string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string,
        callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): [string, Array<string>];
    
    function readFile(
        source: string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string,
        callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): Promise<string>;
    
    function readFileSync(
        source: string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string,
        callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): string;
    
    function writeFile(
        writeTo: string,
        source: string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string,
        callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): Promise<string>;
    
    function writeFileSync(
        writeTo: string,
        source: string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string,
        callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): string;
}


// <============================================FILE============================================>


export declare function file(
    source: string,
    sources?: Object | string | Array<Object | string>,
    start?: string,
    end?: string,
    callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
): string;
export declare namespace file {
    function unresolved(
        source: string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string,
        callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): [string, Array<string>];
    function readFile(
        source: string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string,
        callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): Promise<string>;
    function readFileSync(
        source: string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string,
        callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): string;
    function writeFile(
        writeTo: string,
        source: string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string, callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): Promise<string>;
    function writeFileSync(
        writeTo: string,
        source: string,
        sources?: Object | string | Array<Object | string>,
        start?: string,
        end?: string, callback?: (value: any, match: string, str: string, source: Object, sources: Object) => any
    ): string;
}
