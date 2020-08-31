# STAMP

## What problem does Stamp solve?

Often components are lightweight — they are used in a single container and don't mutate a lot once applied. Stamp is a simple tool to manage these lightweight components.

The concept is simple:
- you write the component (or stamp) within a `<template>` tag, right inside the container that will received them;
- you give the stamp a "mutator" function that populates it with the data you want.
- all methods are chainable, and when you're ready, just `stamp()` it!

### Example code
For example, suppose you have a books section to display book cards. The state you want to reflect is:
```javascript
const books = [
  {
    title: 'The hitchhicker\'s Guide to the Galaxy',
    author: 'Douglas Adams',
    link: 'https://example.com/hitchhiker'
  },
  {
    title: 'Room on the Broom',
    author: 'Julia Donaldson',
    link: 'https://example.com/witch'
  }
]
```
The HTML would look like:
```javascript
<section id="books">
  <template id="tpl-book-card"> <!-- See? The template is right inside the container! -->
    <div>
      <a target="_blank" href="">
        <span className="book-card-title"></span>
      </div>
      by <span className="book-card-author"></span>
    </div>
  </template>
</section>
```
Reflect that data with Stamp is just a matter of:
```javascript
books.forEach(book =>
  //Get the stamp template
  Stamp('#tpl-book-card')
    // Define a mutator function to do the DOM manipulation
    .change(function (card) {
      card.querySelector('a')
        .setAttribute('href', book.link)
      card.querySelector('.book-card-title')
        .textContent = book.title
      card.querySelector('.book-card-author')
      .textContent = book.author
    })
    // And stamp it
    .stamp()
)

```
When you load a stamp that has previously been used, its configurations such as mutator function, cap and keep (see API) are retrieved as well. **That means you don't have to keep a reference to the stamp object**. It is more practical to load again from the same template.

And to make reloading a stamp easier, you can set an alias to it like so:
```javascript
// Save an alias
Stamp('#tpl-book-card')
  .alias('bookCard')

// Then use it to retrieve the stamp
Stamp.get('bookCard')
```
> It may be obvious, but the alias is just that: an alias. If you get a selector (eg. '.example'), than call it with an alias ('myExample'), any change you do to cap, target, context, etc will be in effect, regardless of being selected with the selector or alias.

Clearing the components later is also a breeze: running `stamp.clear()` will clear all stamps from that template, while `stamp.clearAll()` will clear every single element that is not a `<template>`. Both functions affect items in the stamp's target (by default, the template's container).

You can however, change the target container, so `stamp()` and `clear()` apply to a different container. You'd do that if you want to reuse the templates somewhere else. You can do so by calling:
```javascript
Stamp('bookCard')
  .target('#some-other-container')
```

And there's some extra minor functionalities you can check out at the API section below.

### Selectors and config

A component is defined by the selector you use to get it. So if you change some properties of the stamp, such as `cap`, `keep`, `target` or `context`, those will be in effect the next time you `get()` the stamp or any aliases you added to him.

You might want to reset those however, and to do so you'd use the second argument of the `get()` method: config. It is just an object holding the configuration you want — in ths case, 'override'.

```javascript
Stamp('#tpl-book-card', { override: true })
```
Currently, the only other config available is `context`, which is explained in detail below. Note that using `context` also automatically overrides the stamp because it assumes you're aiming at a different component with the same selector (a bad idea to begin with).

### Contexts
Out of necessity, an advanced feature was included: contexts. By default, Stamp will look for the selectors within the context of the document, but that can be overwritten. The reason has to do with the lifecycle of the component:

1. Stamp will find the components template.
1. Then clone it. By this time it is a document fragment, not attached to the DOM.
1. Than manipulate the clone (in the document fragment) with your mutator function.
1. Only then the component is added to the DOM.
1. (A second mutator can be passed as an argument to the `stamp()` method — in that case, it will run after the component has been inserted into the DOM.)

But as it happens, your component might have other components inside that needs stamping. Because **by the the time the mutator function runs your component is not attached to the DOM**, using `document.querySelector()` won't work. We need another context.

The simplest way to provide a context is with the config argument. For example:
```javascript
Stamp('#tpl-foo')
  .change(el => {
    Stamp('#tpl-inner-bar', { context: el })
    .stamp()
  })
  .stamp()
```
In the example above, the template foo had an inner template bar. The context of an inner component is the component itself, passed as the argument of the mutator function. Ommiting the context would cause Stamp to look for bar on the document.

> Why isn't the context implied? So you can keep referencing templates outside your document fragment.

There is another way to set a context: the `context()` method. You pass the new context as an argument so it will be used as the context for that stamp. It's main use is to stamp a temlate to a target in a different context. For example:

```javascript
Stamp('#tpl-foo')
  .change(el => {
    Stamp('#tpl-outer-baz')
    .context(el)
    .target('.inner-container')
    .stamp()
    .context()
  })
  .stamp()
```
In the example above, the baz template was on the document, outside of the context of the foo fragment. We selected it, changed the context and then selected the target inside the foo fragment. But noticed we then called `context()` without any arguments — **that will reset the context to document!** This is very important because other parts of the code could be expecting that to be the context for this template. Because of that pitfall, I'd recommend keeping the templates within the context they'll be used in.

> The context is attached to the stamp, so setting it for one template won't interfere on the others. But beware that templates are defined by the selector you use. Two components with the same selector on different contexts will be seen as the same component. Avoiding this pitfall is super simple: don't use the same selector for different components.


## API
- `alias()` <small>:string</small> Give the current stamp an alias, so it's easy to retrieve it later by calling `Stamp.get(alias)`.

- `cap()` <small>:number</small> Set the maximum amount of this component the target may take. Additonal stamps (from the same template) will be ignored.

- `change()` <small>:function</small> Defines a mutator function to be called just before stamping. The function receives the component instance **before** it is appended to the DOM, so manipulations on it are cheaper and you don't get FOUC.

- `clear()` Deletes all stamps from the current template in the current target (by default, the template's parent element).

- `clearAll()` Deletes all elements in the current target, except for `<template>` tags. This will target not only stamps, so use it carefully.

- `debug()` <small>:bool</small> A minor tool that logs to the console the current stamp configuration. A truthy argument will cause debug() to return an object with the data instead of logging to console.

- `execute()` <small>:function</small> Allows you to run a callback on any point in the chain. The function will receive the stamp object as an argument. Use it for side-effects or debugging.

- `get()` <small>:string :obj</small> Loads a template by passing its selector — `Stamp('selector')` and `Stamp.get('selector')` are synonymous. The optional second arguments is a config object that may contain either the properties `override` and `context`. The first, `override` will discard any previous configuration made to the stamp, like mutator function or target. The second, `context` requires an object to be traversed intead of the document in search of selections. When setting context, the stamp is also overridden by default.

- `keep()` <small>:number</small> Set the number of the component's instances you **do not** want to delete when calling `clear()` or `clearAll()`. This setting will spare the first *n* components found.

- `stamp()` <small>:function</small> Creates the component from the template, mutates it and appends to the target (by default, the template's container). If an argument function is passed, it will be run against the element *after* it is appended. In the case of a web-component, the callback will run after the component is defined, so it's reliable to call on their methods.

- `target()` <small>:string</small> Pass a selector to define a new target for the stamp. By default, the target is the template's parent element.
