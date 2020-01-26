const stampData = {}
const aliasData = {}

window.$$ = [
  stampData,
  aliasData
]
const identity = x => x

function StampData (selector) {
  this.selector = selector
  this.template = document.querySelector(selector)
  // this.targetSelector = null
  this.target = this.template.parentElement
  this.cap = Infinity
  this.keep = 0
  this.mutator = identity
}

function createNewStamp (selector) {
  stampData[selector] = new StampData(selector)
}


function Stamp (selector) {
  let data = {}

  function count () {
    const query = `[data-_stamp="${data.selector}"]`
    return data.target.querySelectorAll(query).length
  }

  function deleteElements (list) {
    list.forEach((el, idx) => {
      if (idx >= data.keep)
        el.parentElement.removeChild(el)
    })
  }

  const api = {
    get (selector) {
      const lookup = aliasData[selector]
        ? aliasData[selector]
        : selector
      if (!stampData[lookup])
        createNewStamp(lookup)
      data = stampData[lookup]
      return this
    },
    stamp () {
      if (count() < data.cap) {
        console.log('!!', count(), data.cap)
        const clone = data.template.content.cloneNode(true)
        const cloneContent = clone.firstElementChild
        data.mutator(cloneContent)
        cloneContent.setAttribute('data-_stamp', data.selector)
        data.target.append(clone)
      }
      return this
    },
    alias (alias) {
      aliasData[alias] = data.selector
      return this
    },
    change (mutator) {
      data.mutator = mutator
      return this
    },
    target (targetSelector) {
      // data.targetSelector = targetSelector
      data.target = document.querySelector(targetSelector)
      return this
    },
    keep (keepAmount) {
      data.keep = keepAmount
      return this
    },
    cap (capAmount) {
      data.cap = capAmount
      return this
    },
    clear () {
      const query = `[data-_stamp="${data.selector}"]`
      const stamps = data.target.querySelectorAll(query)
      deleteElements(stamps)
      return this
    },
    clearAll () {
      const children = Array.from(data.target.children)
        .filter(el => el.tagName != 'TEMPLATE')
      deleteElements(children)
      return this
    },
    execute (func) {
      func(this)
      return this
    },
    debug () {
      console.log('stamp data:', data)
      return this
    }
  }

  if (selector) api.get(selector)
  return api
}

export default Stamp