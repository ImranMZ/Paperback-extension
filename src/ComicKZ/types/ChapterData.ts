export type ChapterDataResponse = {
    chapter?: ChapterDetail
    chapterList?: ChapterListItem[]
    dupGroupChapters?: any[]
    chapterLangList?: ChapterLang[]
}

export type ChapterDetail = {
    id?: number
    chap?: string
    vol?: string | null
    title?: string
    hid?: string
    group_name?: string
    created_at?: string
    updated_at?: string
    lang?: string
    langName?: string
    user_liked?: boolean
    is_last_chapter?: boolean
    comic?: ChapterComic
    images?: ChapterImage[]
    translation_group?: TranslationGroup
}

export type ChapterListItem = {
    id?: number
    hid?: string
    chap?: string
    title?: string
    lang?: string
    group_name?: string[]
}

export type ChapterComic = {
    id?: number
    title?: string
    description?: string
    slug?: string
    genres?: any[]
    content_rating?: string
    default_thumbnail?: string
    author_names?: string
}

export type ChapterImage = {
    h?: number
    w?: number
    name?: string
    s?: string | null
    url?: string
    optimized?: string | null
}

export type TranslationGroup = {
    id?: number
    slug?: string
    title?: string
}

export type ChapterLang = {
    lang?: string
    langName?: string
    hid?: string
    chap?: string
    title?: string
    group_name?: string[]
}
