export type ChapterListResponse = {
    data?: ChapterListItem[]
    pagination?: Pagination
}

export type ChapterListItem = {
    id?: number
    hid?: string
    chap?: string
    title?: string
    vol?: string | null
    lang?: string
    publish_at?: string | null
    group_name?: string[]
    md_chapters_groups?: ChapterGroup[]
    up_count?: number
    down_count?: number
    is_the_last_chapter?: boolean
    identities?: null
    created_at?: string
    updated_at?: string
}

export type ChapterGroup = {
    md_groups?: {
        title?: string
        slug?: string
    }
}

export type Pagination = {
    current_page?: number
    per_page?: number
    last_page?: number
    total?: number
    links?: PaginationLink[]
}

export type PaginationLink = {
    url?: string | null
    label?: string
    active?: boolean
}
