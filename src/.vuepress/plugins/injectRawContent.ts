import { fs } from 'vuepress/utils'

export const injectRawContentPlugin = () => ({
  name: 'inject-raw-content',
  extendsPage(page: any) {
    if (page.filePath) {
      page.data['rawContent'] = fs.readFileSync(page.filePath, 'utf-8')
    }
  }
})