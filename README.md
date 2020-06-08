# Templatizejs

A simple node modules that provides the ability to take your normal JSON, YAML,
or file and extend them through the use of templates. This module supports both
browser and node usage. However templatizejs is more useful for the node user
at is lets you parse files, and extend from the process object, vcap env
variables.

## FUTURE SUPPORT

html
css
...

## JSON Intro

json(
    source: Object | string,
    sources: Object | string | Array<Object | string>,
    start: string,
    end: string,
    callback: (...args) => any
): Object

At its simplest templatizejs can grab data from other areas of the JSON object.
It uses JSON path from the root level node to resolve the templates. In the
below example there are two template {{fizz}} and {{buzz}}. A template is
indicated by a opening character sequences and closing character sequences. In
this case it defaults to "{{" and "}}". But templatizejs supports the option to
create you own.

``` javascript
    var templatize = require('templatizejs')
    var json = {
        fizzBuzz: '{{fizz}}{{buzz}}',
        fizz: 'Fizz',
        buzz: 'Buzz'
    }

    templatize.json(json)
    
    // result === {
    //     fizzBuzz: 'FizzBuzz',
    //     fizz: 'Fizz',
    //     buzz: 'Buzz'
    // }
```

## Secondary Sources

Templatizejs supports multiple sources to extend your JSON object from. First
the template will try to resolve from its own self then move on to the secondary
sources in attempt to resolve the template. Secondary can be an array or a
single JSON object.

``` javascript
    var templatize = require('templatizejs')
    var json = {
        fizzBuzz: '{{fizz}}{{buzz}}',
    }

    var secondaries = [
        { fizz: 'Fizz' },
        { buzz: 'Buzz' }
    ]

    templatize.json(json, secondaries)
    
    // result === {
    //     fizzBuzz: 'FizzBuzz',
    // }
```

## Custom Template

By default templatizejs default to its own internal template start:"{{" end:"}}"
but this can be changed to anything the user wants. The start and end template
are provided individually as arguments.

``` javascript
    var templatize = require('templatizejs')
    var json = {
        fizzBuzz: '${fizz}${buzz}',
        fizz: 'Fizz',
        buzz: 'Buzz'
    }

    templatize.json(json, '${', '}')
    
    // result === {
    //     fizzBuzz: 'FizzBuzz',
    //     fizz: 'Fizz',
    //     buzz: 'Buzz'
    // }
```

## defaults

Templatizejs will recursively resolve templates until no more template can be
resolved. At which time defaults will be used to give the template a value.
Templates can be used as defaults and can be continuously nested depending on
the use case. A default is indicated by the value which takes place after a
colon inside the template start and end characters.

``` javascript
    var templatize = require('templatizejs')
    var json = {
        fizzBuzz: '${fizz: Fizz}${buzz: ${Buzz: Buzz }}',
    }

    templatize.json(json, '${', '}')
    
    // result === {
    //     fizzBuzz: 'FizzBuzz',
    // }
```

## Methods

| methods            | description                                                                                                       |
|--------------------|-------------------------------------------------------------------------------------------------------------------|
| json.unresolved    | returns an array with two elements 0 the resolved JSON 1 a list of unresolved templates                           |
| json.readFile      | support all the features of the main yaml method but with the addition to suppporting file paths                  |
| json.readFileSync  | same as readFile but blocks the event loop                                                                        |
| json.writeFile     | same as readFile but first param is a path which points to a location on where to write the result of the parsing |
| json.writeFileSync | same as writeFile but blocks the event loop                                                                       |

## json.unresolved

json.unresolved(
    source: Object | string,
    sources: Object | string | Array<Object | string>,
    start: string,
    end: string,
    callback: (...args) => any
): [ Array<string>, Object ]

Will return an array with the first element being the result of parsing and the
second element being the list of unresolved templates. This can be a useful for
custom use case when templates are required to be resolved, throw an error,
logging a warning etc.

``` javascript
    var templatize = require('templatizejs')
    var json = {
        fizzBuzz: '{{fizz}}{{buzz}}',
        fizz: 'Fizz',
    }

    var [ result, templates ] = templatize.json.unresolved(json)
    
    // result === {
    //     fizzBuzz: 'Fizz{{buzz}}',
    //     fizz: 'Fizz',
    // }

    // template === ['Fizz{{buzz}}']
```

## json.readFile

json.readFile(
    source: Object | string,
    sources: Object | string | Array<Object | string>,
    start: string,
    end: string,
    callback: (...args) => any
): Promise<Object>

If there is a JSON or YAML file in your application used for configuration this
method will read the file and return the resolved JSON. It return a bluebird
promise if you want to work with callbacks instead you can use bluebird to
convert the promise to a callback. json.readFile supports
files, objects, or yaml strings as sources.

``` javascript
    var templatize = require('templatizejs')

    templatize.json.readFile(__dirname + '/someJSON.json').then(function(result){
        // do something
    })
```

## json.readFileSync 

json.readFileSync(
    source: Object | string,
    sources: Object | string | Array<Object | string>,
    start: string,
    end: string,
    callback: (...args) => any
): Object

Same as readFile but blocks the event loop and no need to use a promise.

``` javascript
    var templatize = require('templatizejs')

    var result = templatize.json.readFileSync(__dirname + '/someJSON.json')
    
    // do something
```

## json.writeFile

json.writeFile will create a JSON file at the provided path. This method returns
a bluebird Promise when the file has been written and the resolved JSON is
return in the promise. The first argument is required to be a path to
the destination of where the file should be written to. If a file already exist
at the provided destination the file will be overridden. json.writeFile supports
files, objects, or yaml strings as sources of data.

json.writeFile(
    writeTo: string,
    source: Object | string,
    sources: Object | string | Array<Object | string>,
    start: string,
    end: string,
    callback: (...args) => any
): Promise<Object>

``` javascript
    var templatize = require('templatizejs')
    var json = {
        fizzBuzz: '{{fizz}}{{buzz}}',
        fizz: 'Fizz',
    }

    templatize.json.writeFile(__dirname + '/newJSONFile.json', json)
        .then(function(result) {
            // file has been create at __dirname + '/newJSONFile.json'
            // and result is the resolved JSON object
            // do something
        })
```

## json.writeFileSync

json.writeFileSync(
    writeTo: string,
    source: Object | string,
    sources: Object | string | Array<Object | string>,
    start: string,
    end: string,
    callback: (...args) => any
): Object

Same as writeFile but blocks the event loop and no need to use a promise.

``` javascript
    var templatize = require('templatizejs')
    var json = {
        fizzBuzz: '{{fizz}}{{buzz}}',
        fizz: 'Fizz',
    }

    var result = templatize.json.writeFileSync(__dirname + '/newJSONFile.json', json)

    // file has been create at __dirname + '/newJSONFile.json'
    // and result is the resolved JSON object
    // do something
```

## YAML Intro

yaml(
    source: string,
    sources: Object | string | Array<Object | string>,
    start: string,
    end: string,
    callback: (...args) => any
): string

The templatize yaml method is very similar to the json method but it return a
yaml string. Just like the json method it excepts either a json object or yaml
string and uses a JSON path from the root level node to resolve the templates.
It also supports the same arguments in the same order. In the below example
there are two template {{fizz}} and {{buzz}}. A template is indicated by a
opening character sequences and closing character sequences. In this case it
defaults to "{{" and "}}". But templatizejs supports the option to create you
own.

``` javascript
    var templatize = require('templatizejs')
    var yaml = {
        fizzBuzz: '{{fizz}}{{buzz}}',
        fizz: 'Fizz',
        buzz: 'Buzz'
    }

    templatize.yaml(json)
    
    // result ===
    //     fizzBuzz: FizzBuzz
    //     fizz: Fizz
    //     buzz: Buzz
```

### Methods

The Methods for yaml are all the same as json but instead of returning json or
writing json files the methods return yaml strings or write yaml files.

| methods            | description                                                                                                       |
|--------------------|-------------------------------------------------------------------------------------------------------------------|
| yaml.unresolved    | returns an array with two elements 0 the resolved yaml 1 a list of unresolved templates                           |
| yaml.readFile      | support all the features of the main yaml method but with the addition to suppporting file paths                  |
| yaml.readFileSync  | same as readFile but blocks the event loop                                                                        |
| yaml.writeFile     | same as readFile but first param is a path which points to a location on where to write the result of the parsing |
| yaml.writeFileSync | same as writeFile but blocks the event loop                                                                       |

## FILE Intro

file(
    source: string,
    sources: Object | string | Array<Object | string>,
    start: string,
    end: string,
    callback: (...args) => any
): string


The templatize file method is very similar to the json and yaml method but it
return the content of that file with the resolved templates. It also supports
a plain string type. It also supports the same arguments in the same order as
json and yaml methods. But, secondaries data sources are required to resolve
the json paths used in the templates. You wont be able to pull data from the
actual file itself.

``` javascript
    var fs = require('fs')
    var templatize = require('templatizejs')
    var file = fs.readFileSync('./path/toData')

    // content in file
    // '{{fizz}}{{buzz}}'

    var source = {
        fizz: 'Fizz',
        buzz: 'Buzz'
    }
    var result = templatize.file(json)
    
    // result === 'FizzBuzz'
```

### Methods

The Methods for file are all the same as json and but instead of returning json or
yaml it returns the contents of the file with the resolved templates.

| methods            | description                                                                                                            |
|--------------------|------------------------------------------------------------------------------------------------------------------------|
| file.unresolved    | returns an array with two elements 0 the resolved file string 1 a list of unresolved templates                         |
| file.readFile      | support all the features of the main file method but with the addition to suppporting file paths async returns promise |
| file.readFileSync  | internally calls file no difference in logic                                                                           |
| file.writeFile     | same as readFile but first param is a path which points to a location on where to write the result of the parsing      |
| file.writeFileSync | same as writeFile but blocks the event loop                                                                            |


## Signitures

Templatizejs is smart, arguments do not have to be present but these still have
to be in the expected order. Templatize will normalize the request based on the
arguments order, and type, then catagroized, resolve, and order them to fit the
signiture of the given method.

| args     | description                                                                                                              |
|----------|--------------------------------------------------------------------------------------------------------------------------|
| writeTo  | for writeFile methods only, the location to write the results                                                            |
| source   | the main source of data where the value injection takes place                                                            |
| sources  | additional sources of data which data is pulled from to inject values into the main source                               |
| start    | by default templatize uses {{ for the starting template sequence a custom sequence can be provided                       |
| end      | by default templatize uses }} for the ending template sequence a custom sequence can be provided                         |
| callback | callback is executed for every template which is found. The value returned from the callback is injected into the source |

## callback

The callback is executed for every template which is found. The value
returned from the callback is injected into the source. 

value, match, str, main, secondaries

| params  | description                                                                  |
|---------|------------------------------------------------------------------------------|
| value   | the value found based on the template if no value found defaults to template |
| match   | the matching template string includes the start and end template characters  |
| str     | the full string the template was found                                       |
| source  | the main source                                                              |
| sources | the secondaries sources                                                      |
