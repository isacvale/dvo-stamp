# STAMP

## What problem does Stamp solve?

Quite often components are lightweight. By that I mean they are reused in a single place and reflect static state (usually from an array and vaery little change once rendered). Stamp is a very simple way to deal with this lightweight componentization requirement, in a native and hassle-free way.

The concept is simple:
- you write the lightweight component (or stamp), within a `<template>` tag, inside a wrapper element that will received them;
- you write a mutator function that populates the stamp with the data you want.
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
  <template id="tpl-book-card">
    <div>
      <a target="_blank" href="">
        <span className="book-card-title"></span>
      </div>
      by <span className="book-card-author></span>
    </div>
  </template>
</section>
```
Reflect that data with Stamp is just a matter of:
```javascript
books.forEach(book =>
  //Get the stamp template
  Stamp('#tpl-book-card')
    // Define a mutator function
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

Clearing the components later is also a breeze: running `stamp.clear()` will clear all stamps from that template, while `stamp.clearAll()` will clear every single element that is not a `<template>`. Both functions affect items in the stamp's target (by default, the template's container).

You can however, change the target container, so `stamp()` and `clear()` apply to a different container. You'd do that if you want to reuse the templates somewhere else. You can do so by calling:
```javascript
Stamp('bookCard')
  .target('#some-other-container')
```

And there's some extra minor functionalities you can check out at the API section below.

## API
- `get()` <small>:string</small> Load a template by passing its selector. `Stamp('selector')` and `Stamp.get('selector')` are synonymous.

- `stamp()` <small>:function</small> Creates the component from the template, mutates it and appends to the target (by default, the template's container). If an argument function is passed, it will be run against the element *after* it is appended.
- `alias()` <small>:string</small> Give the current stamp an alias, so it's easy to retrieve it later by calling `Stamp.get(alias)`.
- `change()` <small>:function</small> Defines a mutator function to be called just before stamping. The function receives the component instance **before** it is appended to the DOM, so manipulations on it are cheaper and you don't get FOUC.
- `target()` <small>:string</small> Pass a selector to define a new target for the stamp. By default, the target is the template's parent element.
- `keep()` <small>:number</small> Set the number of the component's instances you **do not** want to delete when calling `clear()` or `clearAll()`. This setting will spare the first *n* components found.
- `cap()` <small>:number</small> Set the maximum amount of this component the target may take. Additonal stamps (from the same template) will be ignored.
- `clear()` Deletes all stamps from the current template in the current target (by default, the template's parent element).
- `clearAll()` Deletes all elements in the current target, except for `<template>` tags. This will target not only stamps, so use it carefully.
- `execute()` <small>:function</small> Allows you to run a callback on any point in the chain. The function will receive the stamp object as an argument. Use it for side-effects or debugging.
- `debug()` A minor tool that logs to the console the current stamp configuration.