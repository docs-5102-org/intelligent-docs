import { defineClientConfig } from 'vuepress/client'
import CopyMdButton from './components/CopyMdButton.vue'
import { injectRawContentPlugin } from './plugins/injectRawContent.js'

export default defineClientConfig({
  enhance({ app }) {
    app.component('CopyMdButton', CopyMdButton)
  }
})