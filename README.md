# Templatizejs

A simple node modules that provides the ability to take your normal JSON
structures and extend them through the use of templates. This module supports
both browser and node usage. However templatizejs is more useful for the node
user at is lets you extend from the process object and vcap env variables.

Templatizejs supports YAML and will convert JSON and return a JSON object
with the templates resolved.

## FUTURE SUPPORT

html
css
yaml
file
...

## JSON Intro

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

| methods       | description                                                                                                            |
|---------------|------------------------------------------------------------------------------------------------------------------------|
| json.unresolved    | returns an array with two elements 0 the resolved JSON 1 a list of unresolved templates                           |
| json.readFile      | support all the features of the main JSON method but with the addition to suppporting file paths                  |
| json.readFileSync  | same as readFile but blocks the event loop                                                                        |
| json.writeFile     | same as readFile but first param is a path which points to a location on where to write the result of the parsing |
| json.writeFileSync | same as writeFile but blocks the event loop                                                                       |

## json.unresolved

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

If there is a JSON or YAML file in your application used for configuration this
method will read the file and return the resolved JSON. This method is
synchronous and will block the event loop. It return a bluebird promise if you
want to work with callbacks instead you can use bluebird to convert the promise
to a callback.

``` javascript
    var templatize = require('templatizejs')

    templatize.json.readFile(__dirname + '/someJSON.json').then(function(result){
        // do something
    })
```

## json.readFileSync 

Same as readFile but blocks the event loop and no need to use a promise.

``` javascript
    var templatize = require('templatizejs')

    var result = templatize.json.readFileSync(__dirname + '/someJSON.json')
    
    // do something
```

## json.writeFile

json.writeFile will create a JSON file at the provide path. This method returns
a bluebird Promise when the file has been written and the resolved JSON is
return in the promise callback. The first argument is required to be a path to
the destination of where the file should be written to. If a file already exist
at the provided destination the file will be overridden. json.writeFile supports
files, objects, or yaml strings as sources of data.

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