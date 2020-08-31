const stampData = {}
const aliasData = {}

const identity = x => x

function StampData (selector, context) {
  this.selector = selector
  this.template = context.querySelector(selector)
  this.target = this.template.parentElement
  this.cap = Infinity
  this.keep = 0
  this.mutator = identity
  this.context = context
}

function createNewStamp (selector, context) {
  stampData[selector] = new StampData(selector, context)
}

function Stamp (selector, config={}) {
  let data = { context: config.context || document }

  function count () {
    const query = `[data-_stamp="${data.selector}"]`
    return data.target.querySelectorAll(query).length
  }

  function deleteElements (list) {
    list.forEach((el, idx) => {
      if (idx >= data.keep) {
        el.parentElement.removeChild(el)
      }
    })
  }

  const api = {
    get (selector, config={}) {
      const context = config.context || document
      const override = config.override || false

      const originalSelector = aliasData[selector]
        ? aliasData[selector]
        : selector
        
      if (!stampData[originalSelector] || override || config.context) {
        createNewStamp(originalSelector, context)
      }

      data = stampData[originalSelector]
      
      return this
    },
    stamp (callback) {
      if (count() < data.cap) {
        const target = data.target
        const clone = data.template.content.cloneNode(true)
        const cloneContent = clone.firstElementChild
        data.mutator(cloneContent)
        cloneContent.setAttribute('data-_stamp', data.selector)
        target.append(clone)
        if (callback) {
          const appendedElement = target.lastElementChild
          const tag = appendedElement.tagName.toLowerCase()
          if (tag.includes('-')) {
            customElements.whenDefined(tag)
              .then(() => callback(appendedElement))
          } else {
            callback(appendedElement)
          }
        }
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
      data.target = data.context.querySelector(targetSelector)
      return this
    },
    context (element=document) {
      data.context = element
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
        .filter(el => el.tagName !== 'TEMPLATE')
      deleteElements(children)
      return this
    },
    execute (func) {
      func(this)
      return this
    },
    debug (returnResult=false) {
      if (!returnResult) console.debug('stamp data:', data)
      return returnResult ? data : this
    }
  }

  if (selector) api.get(selector, config)
  return api
}

export default Stamp
