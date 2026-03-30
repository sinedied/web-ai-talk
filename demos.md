## Demo 1: agentic skills (yohan)

- Opus 4.6 => Look at open issues in the repo and implement the first one

- Show the skills folders in the repo
  * gh-cli => I use GH, but you can have one for whatever system you use for project management
  * explain other skills

- Skills are composable and I said before a good use for them is for repeatable workflow. Let's see what I have in my AGENTS.md
  * explain workflow

- Let the agent run and show phone screen with the changes, and the video

- Run dev server, and send the URL to me on telegram so I can test you changes on my phone

## Demo 2: chrome mcp (olivier)

TODO: Olivier

## Demo 3: AI in chrome devtools (yohan)

- Show how to enable AI features in Chrome DevTools
- Go to about page, open devtools

- CORS error => explain this error

- Open network tab
  * request in error => ask AI => Why is the request failing?

- Select "about seine" => ask AI
  * Make the "Seine" text css have a nice gradient in line with color theme (look at css vars)
  * Apply to workspace

- Open github.com => performance => hit refresh
  * Insights => LCP => ask AI => How to optimize LCP on this page?
  * Sources => githubassets.com / assets/app/components...
    * Ask AI => What does this script do? 

## Demo 4: AI in your website

### summarize (olivier)

TODO: Olivier

```
if Summarize in self

create Summarizer

Summarizer options

Summarizer context

Summarizer monitor

call Summarizer

return Summarizer
```

### proofreader (olivier)

TODO: Olivier

```
if proofreader in self

create ProofReader

expectedInputLanguages

call proofReader

return proofReader

```

### create LanguageModel avec image (yohan)

- Snippets: ll1->ll6
- Open reviews, upload image of broken headphones and wait

## Demo 5: WebMCP (olivier)

### To prepare for the demo:
Install Chrome extensions:
  - [MCP-B](https://chromewebstore.google.com/detail/mcp-b-extension/daohopfhkdelnpemnhlekblhnikhdhfa)
To provide a proxy to be able to call the tools from any agent
Add the mcp server:
```json
"webmcp": {
  "type": "http",
  "url": "https://webmcp-backend-prod-v2.alexmnahas.workers.dev/mcp?key=c2d0586a-2a3b-4962-a3eb-24f7b9831a1d",
  "disabled": false
},
```
Note: When registering a new tool in the application, reload the tools of the mcp server in the IDE (or wherever)

  - [WebMCP Inspector](https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd)


### Let's code!

2 modes: Imperative and Declarative

#### 1. Imperative (JavaScript)

Les tools décarés en JavaScript peuvent être registered et unregistered dynamiquement en utilisant l'API `registerTool`

In `cart.js`
```javascript
import '@mcp-b/global';

const addToCartTool = {
    name: "add_to_cart",
    description: "Add the item to the cart",
    inputSchema: {
        type: "object",
        properties: {
            item: { type: "string", description: "Item name" },
            quantity: { type: "integer", minimum: 1 }
        },
    },
    execute: ( {item, quantity }) => {
        console.log(`${quantity} ${item} added to the cart`);
        return `${quantity} ${item} added to the cart`
    } 
}

navigator.modelContext.registerTool(addToCartTool);

navigator.modelContext.registerTool(addToCartTool);
```

#### 2. Declarative (HTML)
Utilise l'aAPI Declarative pour transformer des formulaires HTML en tools WebMCP en utilisant des anotations pour définir un formulaire comme tool en lui donnant un nom. Tous les champs du formulaires sont automatiquement détectés comme paramètre du tool.   
Le navigateur traduit tout ça en quelque chose de similaire à ce qu'on a dans la déclaration impérative des tools.

in `index.html`
```html
  <form ... toolname="write_review_tool">
    <input type="radio" ... toolparameterdescription="Rate the product" />
    <input id="review-title" ... toolparamdescription="A title for the review" />
    <textarea id="review-text" ...  toolparamdescription="A description of your review"></textarea>
  </form>
```
Show (in extension):
- The inputSchema (copy/paste the json in an IDE). 
  - Show that we have the `toolparamdescription` where we put them
  - Have all the `<option>` of the selecte populated
  - The photo input didn't have a `toolparamdescription` so by default it is taking it's nearest `<label>`

=> Show example using extension

Quand un agent appel le tool, il va mettre automatiquement le focus sur le formulaire et remplir les champs. Par défaut il faut toujours aller cliquer sur le bouton "Submit"

Add `toolautosubmit` attribute to `<form ...>`
```html
<form ... toolname="write_review_tool" toolautosubmit>
```
=> Show example using extension and result in console
