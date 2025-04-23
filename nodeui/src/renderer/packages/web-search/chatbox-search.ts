import WebSearch, { SearchResult } from './base'
import { webBrowsing } from '@/packages/remote'

export class ChatboxSearch extends WebSearch {
  private licenseKey: string

  constructor(licenseKey: string) {
    super()
    this.licenseKey = licenseKey
  }

  async search(query: string): Promise<SearchResult> {
    if (this.licenseKey) {
      const res = await webBrowsing({
        licenseKey: this.licenseKey,
        messages: [
          {
            role: 'user',
            content: query,
          },
        ],
      })

      return {
        items: res.links.map((link) => ({
          title: link.title,
          link: link.url,
          abstract: link.title,
        })),
      }
    } else {
      return {
        items: [],
      }
    }
  }
}
