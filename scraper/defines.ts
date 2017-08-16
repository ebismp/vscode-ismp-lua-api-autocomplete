import * as osmosis from "osmosis"
import * as fs from "fs"
import * as htmlToText from "html-to-text"
import * as _ from "lodash"

import { getRegexMatches, parseHtml } from "./utils"
import config from "./config"
const { keys, assign } = Object

const DEFINES_URL = config.baseUrl + "/defines.html"
const EVENTS_URL = config.baseUrl + "/events.html"

export const scrape = () => {
    const definesPromise = new Promise<ISMPTypeMap>((resolve, reject) => {
        const defines: ISMPTypeMap = {}

        osmosis
            .get(DEFINES_URL)
            .find("div.element table.brief-members tr")
            .set("name", "td.header")
            .select("td.description")
            .set("doc", (context) => {
                let { innerHTML } = context
                if (!innerHTML || innerHTML.trim() === "") return
                return htmlToText.fromString(innerHTML, config.htmlToText)
            })
            .data((defineData: ISMPType, next) => {
                let words = defineData.name.split(".")
                words.shift() // remove "defines" word

                const tree: ISMPTypeMap = {}
                let define = words.reduce((result: ISMPType | ISMPTypeMap, word, i) => {
                    let notLast = i < (words.length - 1)
                    let curr: ISMPType = { type: "define" }
                    result[word] = curr

                    if (notLast) {
                        if (!curr.properties) {
                            curr.properties = {}
                        }
                        return result[word].properties
                    }
                    return curr
                }, tree)

                _.merge(define, defineData)
                _.merge(defines, tree)
            })
            .done(() => {
                console.log(`done: ${keys(defines).length} defines parsed`)
                resolve(defines)
            })
    })

    const eventsPromise = new Promise<ISMPType[]>((resolve, reject) => {
        let events: ISMPType[] = []

        osmosis
            .get(EVENTS_URL)
            .find("div.element")
            .set("name", "div.element-header")
            .select("div.element-content")
            .set("doc", (context) => {
                return parseHtml(context.innerHTML)
            })
            .data((data) => {
                data.type = "event"
                events.push(data)
            })
            .log(console.log)
            .error(console.log)
            //.debug(console.log)
            .done(() => {
                console.log(`done: ${keys(events).length} events parsed`)
                resolve(events)
            })
    })

    return new Promise<ISMPTypeMap>((resolve, reject) => {
        Promise
            .all([definesPromise, eventsPromise])
            .then(([defines, events]) => {
                // First event is the parent of all events
                const parentEvent = events.shift()
                events.forEach(event => {
                    event = _.merge({}, parentEvent, event)
                    if (defines.events.properties[event.name]) {
                        defines.events.properties[event.name] = event
                    }
                })

                resolve(defines)
            })
    })
}
