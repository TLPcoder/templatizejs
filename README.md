# TemplateJS

A simple node modules that provides the ability to take your normal JSON
structures and extend them through the use of templates. This module supports
both browser and node usage. However templatejs is more useful for the node
user at is lets you extend from the process object and vcap env variables.

TemplateJS supports YAML and will convert JSON and return a JSON object
with the templates resolved.

## FUTURE SUPPORT

html
css
yaml
file
...

## Intro

At its simplest templateJS can grab data from other areas of the JSON object.
It uses JSON path from the root level node to resolve the templates. In the
below example there are two template {{fizz}} and {{buzz}}. A template is
indicated by a opening character sequences and closing character sequences. In
this case it defaults to "{{" and "}}". But templateJS supports the option to
create you own.

``` javascript
    var templateJS = require('templatejs')
    var json = {
        fizzBuzz: '{{fizz}}{{buzz}}',
        fizz: 'Fizz',
        buzz: 'Buzz'
    }

    templateJS.json(json)
    
    // json === {
    //     fizzBuzz: 'FizzBuzz',
    //     fizz: 'Fizz',
    //     buzz: 'Buzz'
    // }
```

## Secondary Sources

TemplateJS supports multiple sources to extend your JSON object from. First
the template will try to resolve from its own self then move on to the secondary
sources in attempt to resolve the template. Secondary can be an array or a
single JSON object.

``` javascript
    var templateJS = require('templatejs')
    var json = {
        fizzBuzz: '{{fizz}}{{buzz}}',
    }

    var secondaries = [
        { fizz: 'Fizz' },
        { buzz: 'Buzz' }
    ]

    templateJS.json(json)
    
    // json === {
    //     fizzBuzz: 'FizzBuzz',
    //     fizz: 'Fizz',
    //     buzz: 'Buzz'
    // }
```

## Custom Template

By default templateJS default to its own internal template start:"{{" end:"}}"
but this can be changed to anything the user wants. The start and end template
are provided individually as arguments.

``` javascript
    var templateJS = require('templatejs')
    var json = {
        fizzBuzz: '${fizz}${buzz}',
        fizz: 'Fizz',
        buzz: 'Buzz'
    }

    templateJS.json(json, '${', '})
    
    // json === {
    //     fizzBuzz: 'FizzBuzz',
    //     fizz: 'Fizz',
    //     buzz: 'Buzz'
    // }
```

## defaults

TemplateJS will recursively resolve templates until no more template can be
resolved. At which time defaults will be used to give the template a value.
Templates can be used as defaults and can be continuously nested depending on
the use case. A default is indicated by the value which takes place after a
colon inside the template start and end characters.

``` javascript
    var templateJS = require('templatejs')
    var json = {
        fizzBuzz: '${fizz: Fizz}${buzz: ${Buzz: Buzz }}',
    }

    templateJS.json(json)
    
    // json === {
    //     fizzBuzz: 'FizzBuzz',
    //     fizz: 'Fizz',
    //     buzz: 'Buzz'
    // }
```
