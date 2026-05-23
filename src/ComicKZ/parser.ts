import {
    Chapter,
    ChapterDetails,
    ContentRating,
    HomeSection,
    HomeSectionType,
    PartialSourceManga,
    SourceManga,
    TagSection,
    Tag,
} from "@paperback/types"

import { ComicData } from "./types/ComicData"
import { ChapterListItem } from "./types/ChapterList"
import { ChapterDetail, ChapterDataResponse } from "./types/ChapterData"
import { SearchItem } from "./types/SearchResult"

const ID_SEP = "|#|"
const CHAPTER_ID_SEP = "|~|"

export class Parser {
    parseMangaDetails(data: ComicData, mangaId: string): SourceManga {
        const title = data.title ?? ""
        const desc = data.desc ?? data.parsed ?? ""
        const thumbnail = data.default_thumbnail ?? ""
        const author = data.author_names ?? ""
        const contentRating = this.mapContentRating(data.content_rating ?? "")
        const status = this.mapStatus(data.status)

        const genres = data.genres ?? []
        const tagSections: TagSection[] = []
        if (genres.length > 0) {
            const tags: Tag[] = genres.map((g) =>
                App.createTag({ id: g.slug ?? "", label: g.name ?? "" })
            )
            tagSections.push(
                App.createTagSection({ id: "0", label: "genres", tags })
            )
        }

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [title],
                image: thumbnail,
                status,
                tags: tagSections,
                desc: this.stripHtml(desc),
                author,
                artist: author,
                rating: data.bayesian_rating
                    ? Number(data.bayesian_rating)
                    : 0,
                contentRating,
            }),
        })
    }

    parseChapters(data: ChapterListItem[], mangaId: string): Chapter[] {
        const chapters: Chapter[] = []

        for (const item of data) {
            const hid = item.hid ?? ""
            const chap = item.chap ?? ""
            const id = `${hid}${CHAPTER_ID_SEP}${chap}${CHAPTER_ID_SEP}en`
            const name = this.buildChapterName(item)

            chapters.push(
                App.createChapter({
                    id,
                    name,
                    chapNum: Number(chap) || 0,
                    langCode: "en",
                    time: item.created_at ? new Date(item.created_at) : new Date(0),
                    group: (item.group_name ?? []).join(", "),
                })
            )
        }

        return chapters
    }

    parseChapterDetails(
        data: ChapterDataResponse,
        mangaId: string,
        chapterId: string,
    ): ChapterDetails {
        const chapter = data.chapter ?? ({} as ChapterDetail)
        const images = chapter.images ?? []
        const pages: string[] = []

        for (const img of images) {
            if (img.url) {
                pages.push(img.url)
            }
        }

        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages,
        })
    }

    parseSearchResults(data: SearchItem[]): PartialSourceManga[] {
        const results: PartialSourceManga[] = []

        for (const item of data) {
            const id = item.id ?? 0
            const slug = item.slug ?? ""
            const mangaId = `${id}${ID_SEP}${slug}`
            const subtitle = item.last_chapter
                ? `Ch. ${item.last_chapter}`
                : ""

            results.push(
                App.createPartialSourceManga({
                    mangaId,
                    image: item.default_thumbnail ?? "",
                    title: item.title ?? "",
                    subtitle,
                })
            )
        }

        return results
    }

    parseHomeSections(
        popularData: SearchItem[],
        recentData: SearchItem[],
        updateData: SearchItem[],
        sectionCallback: (section: HomeSection) => void,
    ): void {
        const section1 = App.createHomeSection({
            id: "popular",
            title: "Popular Ongoing",
            containsMoreItems: false,
            type: HomeSectionType.featured,
        })

        const section2 = App.createHomeSection({
            id: "recent",
            title: "Recently Added",
            containsMoreItems: false,
            type: HomeSectionType.singleRowNormal,
        })

        const section3 = App.createHomeSection({
            id: "updates",
            title: "Latest Updates",
            containsMoreItems: false,
            type: HomeSectionType.singleRowNormal,
        })

        section1.items = this.parseSearchResults(popularData)
        sectionCallback(section1)

        section2.items = this.parseSearchResults(recentData)
        sectionCallback(section2)

        section3.items = this.parseSearchResults(updateData)
        sectionCallback(section3)
    }

    private buildChapterName(item: ChapterListItem): string {
        let name = `Chapter ${item.chap ?? "?"}`
        if (item.title) {
            name += ` - ${item.title}`
        }
        if (item.vol) {
            name = `Vol. ${item.vol} ${name}`
        }
        return name
    }

    private mapContentRating(rating: string): ContentRating {
        switch (rating) {
            case "safe":
                return ContentRating.EVERYONE
            case "suggestive":
                return ContentRating.MATURE
            case "erotica":
                return ContentRating.ADULT
            case "pornographic":
                return ContentRating.ADULT
            default:
                return ContentRating.EVERYONE
        }
    }

    private mapStatus(status: number | undefined): string {
        switch (status) {
            case 1:
                return "Ongoing"
            case 2:
                return "Completed"
            case 3:
                return "Cancelled"
            case 4:
                return "Hiatus"
            default:
                return "Unknown"
        }
    }

    private stripHtml(html: string): string {
        return html.replace(/<[^>]*>/g, "").trim()
    }

    extractComicDataJson(html: string): ComicData {
        const match = html.match(
            /<script[^>]*id="comic-data"[^>]*>([\s\S]*?)<\/script>/,
        )
        if (!match?.[1]) {
            throw new Error("Could not find comic-data script tag")
        }
        return JSON.parse(match[1]) as ComicData
    }
}
