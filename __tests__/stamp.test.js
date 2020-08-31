import Stamp from '../src/stamp.js'

document.body.innerHTML = 
`
<div id="container">
  <template id="tpl-hello">
    <p class="hello">hello <span>world</span></p>
  </template>
  <template id="tpl-goodbye">
    <p>goodbye <span>world</span></p>
  </template>
</div>
<div id="alt-container">
</div>

<div class="context common-context">
  <template class="tpl-trap">
    <p data-case="wrong">wrong</p>
  </template>
</div>

<div class="context alternate-context">
  <template class="tpl-trap">
    <p data-case="right">right</p>
  </template>
</div>

<div class="context-target"></div>
<div class="context-target-alt">
  <div class="context-target"></div>
<div>

<div class="custom-container">
  <template id="tpl-custom-element">
    <custom-element><div></div></custom-element>
  </template>
</div>
`

test('Selects a template', () => {
  const stamp = Stamp('#tpl-hello')
    .debug(true)
  expect(stamp.template.id).toBe('tpl-hello')
})

test('Selects a template with get', () => {
  const stamp = Stamp('#tpl-goodbye')
    .get('#tpl-hello')
    .debug(true)
  expect(stamp.template.id).toBe('tpl-hello')
})

test('Switch back selection', () => {
  const stamp = Stamp('#tpl-hello')
    .get('#tpl-goodbye')
    .get('#tpl-hello')
    .debug(true)
  expect(stamp.template.id).toBe('tpl-hello')
})

test('Selects container as default target', () => {
  const stamp = Stamp('#tpl-hello')
    .debug(true)
  expect(stamp.target.id).toBe('container')
})

test('Alias refer to the same stamp', () => {
  const stamp = Stamp('#tpl-hello')
    .alias('Hello')
    .debug(true)
  expect(stamp.template.id).toBe('tpl-hello')
})

test('Succesfully stamps template', () => {
  const stamp = Stamp('#tpl-hello')
    .stamp()
  const target = document.querySelector('#container')
    .querySelector('p')
  expect(target.innerHTML).toBe('hello <span>world</span>')
})

{/*
  // This test is disabled until the virtual DOM can deal with it.
  // At the time of writing, it does work on a real DOM, as shown in index.html
  test('Stamps a mutated template', () => {
    const stamp = Stamp('#tpl-hello')
      .change(el => el.querySelector('span').setAttribute('data-testing', "true"))
      .stamp()
    const attributeText = document.querySelector('#container')
      .querySelector('p')
      .getAttribute('data-testing')
    expect(attributeText).toBe('true')
  })
*/}

test('Hold a mutator', () => {
  const stamp = Stamp('#tpl-hello')
    .change(el => [el])
  const mutator = stamp
    .debug(true)
    .mutator
  expect(mutator('foo')).toEqual(['foo'])
})

test('Clears the container', () =>{
  const stamp = Stamp('#tpl-hello')
  stamp.clear().stamp()
  const itemsBefore = Array.from(document.querySelectorAll('.hello')).length
  stamp.clear()
  const itemsAfter = Array.from(document.querySelectorAll('.hello')).length
  expect([itemsBefore, itemsAfter]).toEqual([1, 0])
})

test('Selects a second template', () => {
  const stamp = Stamp('#tpl-hello')
    .get('#tpl-goodbye')
    .debug(true)
  expect(stamp.template.id).toBe('tpl-goodbye')
})

test('Clears all', () => {
  const stamp = Stamp('#tpl-hello')
    .get('#tpl-goodbye')
    .debug(true)
  expect(stamp.template.id).toBe('tpl-goodbye')
})

test('Changes target', () => {
  const stamp = Stamp('#tpl-hello')
    .target('#alt-container')
    .debug(true)
  expect(stamp.target.id).toBe('alt-container')
})

test('Stamps on changed target', () => {
  const stamp = Stamp('#tpl-hello')
    .target('#alt-container')
    .stamp()
  const stamped = document
    .querySelector('#alt-container')
    .querySelector('.hello')
  expect(!!stamped).toBe(true)
})

test('Getting doesn\'t reset target', () => {
  const stamp = Stamp('#tpl-hello')
    .target('#alt-container')
  const stamp2 = Stamp('#tpl-hello')
    .debug(true)

  expect(stamp2.target.id).toBe('alt-container')
})

test('Limit is recorded on stamp', () => {
  const stamp = Stamp('#tpl-hello')
    .target('#container')
    .keep(3)
    .debug(true)
  expect(stamp.keep).toBe(3)
})

test('Keeps stamp to a limit', () => {
  const stamp = Stamp('#tpl-hello')
    .target('#container')
    .keep(3)
  for (let n = 0; n < 10; n++) {
    stamp.stamp()
  }
  stamp.clear()
  const count = document.querySelectorAll('#container > .hello').length
  expect(count).toBe(3)
})

test('Cap is recorded on stamp', () => {
  const stamp = Stamp('#tpl-hello')
    .target('#container')
    .cap(3)
    .debug(true)
  expect(stamp.cap).toBe(3)
})

test('Keeps stamp to a limit', () => {
  const stamp = Stamp('#tpl-hello')
    .target('#container')
    .clear()
    .cap(5)
  for (let n = 0; n < 10; n++) {
    stamp.stamp()
  }
  const count = document.querySelectorAll('#container > .hello').length
  expect(count).toBe(5)
})

test('Keeps stamp to a limit', () => {
  const stamp = Stamp('#tpl-hello')
    .target('#container')
    .keep(0)
    .cap(Infinity)
    .clear()
    .stamp()
    .stamp()
    .stamp()
  const stamp2 = Stamp('#tpl-goodbye')
    .target('#container')
    .stamp()
    .stamp()
    .clearAll()

  const count = document.querySelectorAll('#container > .hello').length
  expect(count).toBe(0)
})

test('Calls stamp callbacks', () => {
  let works = false
  const changeWorks = () => works = true

  const stamp = Stamp('#tpl-hello')
    .stamp(changeWorks)

  expect(works).toBe(true)
})

// // Commented because Jest doesn't support custom elements yet.
// test('Don\'t call callbacks on an unititiated custom-element.', () => {
//   let works = false
//   const changeWorks = () => works = true
//   Stamp('#tpl-custom-element')
//     .stamp(changeWorks)
//   expect(works).toBe(false)
// })

test('Calls execute callbacks', () => {
  let works = false
  const changeWorks = () => works = true

  const stamp = Stamp('#tpl-hello')
    .execute(changeWorks)

  expect(works).toBe(true)
})

test('Logs debug to console', () => {
  let messages;
  global.console.debug = function (...args) {
    messages = [...args]
  }
  Stamp('#tpl-hello')
    .debug()
  expect(messages[1]['selector']).toBe('#tpl-hello')
})

test('Get stamp on an empty Stamp', () => {
  const stamp = Stamp()
    .get('#tpl-hello')
    .debug(true)
  expect(stamp.template.id).toBe('tpl-hello')
})

test('Get stamp by alias', () => {
  Stamp('#tpl-hello')
    .alias('ohayou')
  const stamp = Stamp('ohayou')
    .debug(true)
  expect(stamp.template.id).toBe('tpl-hello')
})

test('Can switch contexts between stamps', () => {
  const altContext = document.querySelector('.alternate-context')

  // Stamp in default context
  Stamp('.tpl-trap')
    .alias('outer')
    .stamp()
    .get('.tpl-trap', { context: altContext })
    .alias('inner')
    .stamp()
  
  // Stringify results
  const results = Array.from(document.querySelectorAll('.context'))
    .map(context => context
      ? context.querySelector('p').getAttribute('data-case')
      : 'empty')
    .join('-')

  expect(results).toEqual('wrong-right')
})

test('Can switch contexts between stamps repeatedly', () => {
  const altContext = document.querySelector('.alternate-context')

  // Stamp in default context
  Stamp('.tpl-trap')
    .alias('outer')
    .clear()
    .stamp()
    .get('.tpl-trap', { context: altContext })
    .alias('inner')
    .clear()
    .stamp()

    .get('outer', { override: true })
    .stamp()
    .get('inner', { context: altContext })
    .stamp()
    .context()

  // Stringify results
  const results = Array.from(document.querySelectorAll('.context'))
    .map(x => x.children.length)

  expect(results).toEqual([3, 3])
})

test('Can switch contexts without switching stamps', () => {
  const altContext = document.querySelector('.context-target-alt')

  // Stamp in default context
  Stamp('.tpl-trap')
    .target('.context-target')
    .stamp()
    .context(altContext)
    .target('.context-target')
    .stamp()
  
  // Stringify results
  const results = Array.from(document.querySelectorAll('.context-target'))
    .map(x => x.children.length)

  expect(results).toEqual([1, 1])
})


// window.onload = function () {
//   Stamp('#tpl-hello')
//     .alias('foo')
//     .change(el => el.querySelector('span').textContent = "friend")
//     .stamp()
//     .clear()
//   .get('#tpl-goodbye')
//     .change(el => el.querySelector('span').textContent = "friend")
//     .stamp()
//   .get('foo')
//     .clear()
//     .stamp()
//     .clearAll()
//     .target("#alt-container")
//     .stamp()
//     .stamp()
//     .stamp()
//     .keep(2)
//     .clear()
//     .clearAll()
//     .cap(3)
//     .stamp(el => el.setAttribute('doesCallbackWork', 'ohYeah'))
//     .stamp()
//     .stamp()
//     .stamp()
//     .execute(x => console.log('---', x))
//     .debug()
// }

//TODO teste get
//TODO test override on get
