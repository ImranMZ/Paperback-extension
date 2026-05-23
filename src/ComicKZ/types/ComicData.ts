export type ComicData = {
    id?: number
    hid?: string
    title?: string
    slug?: string
    country?: string
    origination?: string
    status?: number
    links?: string[]
    last_chapter?: number
    chapter_count?: number
    demographic_name?: string
    user_follow_count?: number
    follow_rank?: number
    follow_count?: number
    desc?: string
    parsed?: string
    year?: number
    bayesian_rating?: string
    rating_count?: number
    content_rating?: string
    translation_completed?: boolean
    noindex?: boolean
    adsense?: boolean
    has_anime?: boolean
    default_thumbnail?: string
    md_titles?: Record<string, MdTitle>
    firstChapters?: FirstChapter[]
    comic?: ComicExtra
    author_names?: string
    genres?: Genre[]
}

export type MdTitle = {
    id?: number
    comic_id?: number
    title?: string
    lang?: string
}

export type FirstChapter = {
    id?: number
    chap?: string
    lang?: string
    hid?: string
    title?: string
}

export type ComicExtra = {
    id?: number
    title?: string
    description?: string
    slug?: string
    genres?: Genre[]
    content_rating?: string
    default_thumbnail?: string
    author_names?: string
}

export type Genre = {
    id?: number
    name?: string
    slug?: string
    group?: string
}
