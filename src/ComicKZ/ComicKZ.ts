import {
    Chapter,
    ChapterDetails,
    ChapterProviding,
    ContentRating,
    HomePageSectionsProviding,
    HomeSection,
    MangaProviding,
    PagedResults,
    Request,
    Response,
    SearchRequest,
    SearchResultsProviding,
    SourceInfo,
    SourceIntents,
    SourceManga,
    SourceStateManager,
    BadgeColor,
} from "@paperback/types"

import { Parser } from "./parser"
import { ChapterListItem } from "./types/ChapterList"
import { ChapterDataResponse } from "./types/ChapterData"
import { SearchItem } from "./types/SearchResult"

const BASE_URL = "https://comickz.co.uk"
const ID_SEP = "|#|"

export const ComicKZInfo: SourceInfo = {
    version: "1.0.0",
    name: "ComicKZ",
    description: "ComicKZ source extension for Paperback 0.8",
    author: "ImranMZ",
    authorWebsite: "https://github.com/ImranMZ",
    icon: "icon.png",
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: BASE_URL,
    sourceTags: [
        {
            text: "English",
            type: BadgeColor.GREY,
        },
    ],
    intents:
        SourceIntents.MANGA_CHAPTERS |
        SourceIntents.HOMEPAGE_SECTIONS |
        SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
}

export class ComicKZ
    implements
        SearchResultsProviding,
        MangaProviding,
        ChapterProviding,
        HomePageSectionsProviding
{
    baseUrl = BASE_URL
    stateManager: SourceStateManager = App.createSourceStateManager()
    RETRY = 5
    parser = new Parser()

    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 10000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        "user-agent":
                            await this.requestManager.getDefaultUserAgent(),
                        referer: this.baseUrl,
                    },
                }
                return request
            },
            interceptResponse: async (
                response: Response,
            ): Promise<Response> => {
                return response
            },
        },
    })

    private buildUrl(
        path: string,
        params?: Record<string, string>,
    ): string {
        let url = `${this.baseUrl}${path}`
        if (params) {
            const query = Object.entries(params)
                .map(
                    ([key, value]) =>
                        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
                )
                .join("&")
            url += `?${query}`
        }
        return url
    }

    getMangaShareUrl(mangaId: string): string {
        const slug = mangaId.split(ID_SEP)[1]
        return `${this.baseUrl}/comic/${slug}`
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const slug = mangaId.split(ID_SEP)[1]
        if (!slug) {
            throw new Error(`Invalid mangaId: ${mangaId}`)
        }

        const request = App.createRequest({
            url: `${this.baseUrl}/comic/${slug}`,
            method: "GET",
        })
        const response = await this.requestManager.schedule(request, 1)
        const html = response.data as string

        const comicData = this.parser.extractComicDataJson(html)
        return this.parser.parseMangaDetails(comicData, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const slug = mangaId.split(ID_SEP)[1]
        if (!slug) {
            throw new Error(`Invalid mangaId: ${mangaId}`)
        }

        const chapters: Chapter[] = []
        let page = 1
        let lastPage = 1

        do {
            const url = this.buildUrl(
                `/api/comics/${slug}/chapter-list`,
                {
                    lang: "en",
                    page: page.toString(),
                },
            )

            const request = App.createRequest({
                url,
                method: "GET",
            })

            const response = await this.requestManager.schedule(request, 1)
            const json = JSON.parse(response.data as string)
            const data: ChapterListItem[] = json.data ?? []
            const pagination = json.pagination ?? {}

            const parsed = this.parser.parseChapters(data, mangaId)
            chapters.push(...parsed)

            lastPage = pagination.last_page ?? 1
            page++
        } while (page <= lastPage)

        return chapters
    }

    async getChapterDetails(
        mangaId: string,
        chapterId: string,
    ): Promise<ChapterDetails> {
        const slug = mangaId.split(ID_SEP)[1]
        const parts = chapterId.split("|~|")
        const hid = parts[0]
        const chap = parts[1]
        const lang = parts[2] ?? "en"

        if (!slug || !hid || !chap) {
            throw new Error(`Invalid mangaId or chapterId`)
        }

        const request = App.createRequest({
            url: `${this.baseUrl}/api/comics/${slug}/${hid}-chapter-${chap}-${lang}`,
            method: "GET",
        })

        const response = await this.requestManager.schedule(request, 1)
        const json = JSON.parse(
            response.data as string,
        ) as ChapterDataResponse

        return this.parser.parseChapterDetails(json, mangaId, chapterId)
    }

    async getSearchResults(
        query: SearchRequest,
        metadata: any,
    ): Promise<PagedResults> {
        const page = metadata?.page ?? 1

        if (page == -1) {
            return App.createPagedResults({
                results: [],
                metadata: { page: -1 },
            })
        }

        if (!query?.title || query.title.trim() === "") {
            return App.createPagedResults({
                results: [],
                metadata: { page: -1 },
            })
        }

        const url = this.buildUrl("/api/search", {
            q: query.title.trim(),
            limit: "20",
        })

        const request = App.createRequest({
            url,
            method: "GET",
        })

        const response = await this.requestManager.schedule(request, 1)
        const json = JSON.parse(response.data as string)
        const data: SearchItem[] = json.data ?? []

        const results = this.parser.parseSearchResults(data)

        return App.createPagedResults({
            results,
            metadata: { page: -1 },
        })
    }

    async getHomePageSections(
        sectionCallback: (section: HomeSection) => void,
    ): Promise<void> {
        const [popularData, recentData, updateData] = await Promise.all([
            this.fetchHomeSection("popular"),
            this.fetchHomeSection("recent"),
            this.fetchHomeSection("updates"),
        ])

        this.parser.parseHomeSections(
            popularData,
            recentData,
            updateData,
            sectionCallback,
        )
    }

    private async fetchHomeSection(
        section: string,
    ): Promise<SearchItem[]> {
        let queryParams: Record<string, string>

        switch (section) {
            case "popular":
                queryParams = {
                    orderBy: "follow_count",
                    order: "desc",
                    status: "1",
                    limit: "20",
                }
                break
            case "recent":
                queryParams = {
                    orderBy: "created_at",
                    order: "desc",
                    limit: "20",
                }
                break
            case "updates":
                queryParams = {
                    orderBy: "updated_at",
                    order: "desc",
                    limit: "20",
                }
                break
            default:
                return []
        }

        try {
            const url = this.buildUrl("/api/search", queryParams)

            const request = App.createRequest({
                url,
                method: "GET",
            })

            const response = await this.requestManager.schedule(request, 1)
            const json = JSON.parse(response.data as string)
            return (json.data ?? []) as SearchItem[]
        } catch {
            return []
        }
    }

    async getCloudflareBypassRequest(): Promise<Request> {
        return App.createRequest({
            url: this.baseUrl,
            method: "GET",
            headers: {
                "user-agent":
                    await this.requestManager.getDefaultUserAgent(),
                referer: `${this.baseUrl}/`,
            },
        })
    }

    async getViewMoreItems(
        _homepageSectionId: string,
        metadata: any,
    ): Promise<PagedResults> {
        return App.createPagedResults({
            results: [],
            metadata: { page: metadata?.page ?? 1 },
        })
    }
}
