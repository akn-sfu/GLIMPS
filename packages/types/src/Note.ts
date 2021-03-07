interface Author {
    id: number;
    username: string;
    email: string;
    name: string;
    state: string;
    created_at: string;
}

export interface Note {
    id: number;
    body: string;
    attachment: string;
    author: Author;
    created_at: string;
    updated_at: string;
    system: boolean;
    noteable_id: number;
    noteable_type: string;
    noteable_iid: number;
    resolvable: boolean;
    confidential: boolean;
}

export namespace Note {
    export interface Author {
        author_name: string;
        author_email: string;
        repository_member_id?: string;
    }
}