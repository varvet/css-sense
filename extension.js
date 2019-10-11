const vscode = require("vscode");
const path = require("path");
const cssTree = require("css-tree");
const scssTree = require("scss-parser");
const queryAst = require("query-ast");

class CSSSense {
  constructor() {
    this.context = null;
    this.provider = null;
  }

  activate(context) {
    this.context = context;
    this.createProvider();
  }

  deactivate() {}

  getSelectors(document) {
    const _this = this;
    const cssUri = this.getCSSUri(document.getText(), document);

    if (cssUri === null) {
      return new vscode.CompletionList();
    }

    return this.loadUri(cssUri).then(function(a) {
      const selectorArray = a
        .flat()
        .filter(_this.unique)
        .sort();

      return new vscode.CompletionList(
        selectorArray.map(_this.completionListItemFromString)
      );
    });
  }

  completionListItemFromString(str) {
    return new vscode.CompletionItem(str, vscode.CompletionItemKind.Property);
  }

  getCSSUri(txt, document) {
    const m = txt.match(/import styles from (?:'|")(.*)(?:'|");/);
    if (m === null) {
      return null;
    }

    return path.join(path.dirname(document.fileName), m[1]);
  }

  loadUri(uri) {
    const _this = this;
    return new Promise(function(resolve, reject) {
      vscode.workspace.openTextDocument(uri).then(document => {
        const filetype = document.languageId;
        const text = document.getText();
        resolve(_this.parseSelectors(filetype, text));
      });
    });
  }

  unique(value, index, self) {
    return self.indexOf(value) === index;
  }

  parseSelectors(filetype, text) {
    if (filetype === "css") {
      return this.parseCSS(text);
    }
    if (filetype === "scss") {
      return this.parseSCSS(text);
    }

    return [];
  }

  parseCSS(text) {
    let r = [];
    const ast = cssTree.parse(text);
    cssTree.walk(ast, function(node) {
      if (node.type === "ClassSelector") {
        r.push(node.name);
      }
    });
    return r;
  }

  parseSCSS(text) {
    let r = [];
    const ast = scssTree.parse(text);
    const $ = queryAst(ast);
    return r.concat(
      $("class").map(cls => {
        return cls.toJSON().value[0].value;
      })
    );
  }

  createProvider() {
    const _this = this;
    const provider = vscode.languages.registerCompletionItemProvider(
      [{ language: "javascriptreact" }, { language: "typescriptreact" }],
      {
        provideCompletionItems(document, position) {
          let linePrefix = document
            .lineAt(position)
            .text.substr(0, position.character);
          if (!linePrefix.endsWith("styles.")) {
            return undefined;
          }

          return _this.getSelectors(document);
        }
      },
      "." // triggered whenever a '.' is being typed
    );

    this.context.subscriptions.push(provider);
  }
}

const cssSense = new CSSSense();

module.exports.activate = cssSense.activate.bind(cssSense);
module.exports.deactivate = cssSense.deactivate.bind(cssSense);
