"use strict"

import vscode = require("vscode")
import ISMPApiData from "./ISMPApiData"
import { ISMPAutocomplete } from "./ISMPAutocomplete"
import { ISMPHover } from "./ISMPHover"

const LUA_MODE = { language: "lua", scheme: "file" }

export function activate(context: vscode.ExtensionContext) {
    let dataPath = context.asAbsolutePath("./data")
    const ismpApiData = new ISMPApiData(dataPath)

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            LUA_MODE,
            new ISMPAutocomplete(ismpApiData),
            '.'
        )
    )

    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            LUA_MODE,
            new ISMPHover(ismpApiData)
        )
    )
}

// this method is called when your extension is deactivated
export function deactivate() {
}