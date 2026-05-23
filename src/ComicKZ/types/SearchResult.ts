export type SearchResponse = {
    data?: SearchItem[]
}

export type SearchItem = {
    id?: number
    cdn_id?: number
    title?: string
    slug?: string
    hid?: string
    description?: string
    parsed_description?: string
    country?: string
    year?: number
    status?: number
    content_rating?: string
    demographic?: number
    last_chapter?: number
    chapter_count?: number
    follow_count?: number
    user_follow_count?: number
    follow_rank?: number
    bayesian_rating?: string
    rating_count?: number
    translation_completed?: boolean
    final_chapter?: string
    final_volume?: string
    noindex?: boolean
    adsense?: boolean
    login_required?: boolean
    has_anime?: boolean
    is_english_title?: boolean
    default_thumbnail?: string
    display_status?: string
    is_duplicate?: boolean
    limited_titles?: LimitedTitle[]
}

export type LimitedTitle = {
    id?: number
    comic_id?: number
    title?: string
    lang?: string
}
